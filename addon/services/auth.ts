import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { EnvService } from 'ember-runtime-env';
import { LoggerService } from 'ember-logging';
import { createAuth0Client, Auth0Client } from '@auth0/auth0-spa-js';

export default class AuthService extends Service {
  @service env!: EnvService;
  @service logger!: LoggerService;
  @service fastboot!: { isFastBoot: boolean };

  @tracked auth0Client?: Auth0Client;

  @tracked isAuthenticated?: boolean = false;
  @tracked currentUser?: unknown;
  @tracked token?: string;

  @action async initialize() {
    if (!this.fastboot.isFastBoot) {
      this.auth0Client = await createAuth0Client({
        domain: this.env.getEnvVar('auth0Domain') as string,
        clientId: this.env.getEnvVar('auth0ClientId') as string,
        cacheLocation: 'localstorage',
        useRefreshTokens: true,
        useFormData: false, // use json
      });

      const query = window.location.search;
      if (query.includes('code=') && query.includes('state=')) {
        this.logger.debug('AuthService::initialize:handling login...');
        try {
          // Process the login state
          await this.auth0Client.handleRedirectCallback();
        } catch (error) {
          this.logger.error(
            'AuthService::initialize:handleRedirectCallback:error ',
            error,
          );
        }

        // Use replaceState to redirect the user away and remove the querystring parameters
        window.history.replaceState({}, document.title, '/');
        this.logger.debug('AuthService::initialize:handling login complete.');
      } else if (query.includes('error=')) {
        const urlParams = new URLSearchParams(query);
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        this.logger.error(
          `AuthService::initialize:Error: ${error}, Description: ${errorDescription}`,
        );
        this.logger.error(
          'AuthService::initialize:handleRedirectCallback:error ',
          query,
        );
      }
      this.updateUi();
      // subscribe to local storage changes, allows all tabs to [in]validate at once.
      window.addEventListener('storage', () => {
        this.updateUi();
      });
    }
  }

  @action updateUi() {
    this.getIsAuthenticated();
    this.getUser();
  }

  @action async getIsAuthenticated(): Promise<boolean> {
    this.isAuthenticated = (await this.auth0Client?.isAuthenticated()) ?? false;
    this.logger.debug(
      'AuthService::getIsAuthenticated: ',
      this.isAuthenticated,
    );
    if (this.isAuthenticated) {
      await this.getUser();
    }
    return this.isAuthenticated ?? false;
  }

  @action async getUser() {
    this.logger.debug('AuthService::getUser: getting user...');
    this.currentUser = await this.auth0Client?.getUser();
    this.logger.debug('AuthService::getUser:currentUser ', this.currentUser);
    this.logger.debug('AuthService::getUser: getting token ', this.token);
    this.token = await this.auth0Client?.getTokenSilently();
    this.logger.debug('AuthService::getUser:token ', this.token);
    return this.currentUser;
  }

  @action async login() {
    this.logger.debug('AuthService::login: logging in...');
    this.logger.debug(
      'AuthService::login:redirect url => ',
      window.location.origin,
    );
    const loginOptions = {
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: this.env.getEnvVar('auth0Audience') as string,
        scope:
          (this.env.getEnvVar('auth0Scope') as string) ??
          'openid profile name email',
      },
    };
    this.logger.debug('AuthService::login:loginOptions ', loginOptions);
    await this.auth0Client?.loginWithRedirect(loginOptions);
    this.updateUi();
  }

  @action async logout() {
    await this.auth0Client?.logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
    this.updateUi();
  }
}

// Don't remove this declaration: this is what enables TypeScript to resolve
// this service using `Owner.lookup('service:auth')`, as well
// as to check when you pass the service name as an argument to the decorator,
// like `@service('auth') declare altName: AuthService;`.
declare module '@ember/service' {
  interface Registry {
    auth: AuthService;
  }
}
