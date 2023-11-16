# ember-auth0

This addon provides an Ember.js service for integrating with Auth0, a flexible, drop-in solution to add authentication and authorization services to your applications. It leverages the Auth0 SPA SDK to implement features such as login, logout, and session handling. The service is designed to be easy to use, with sensible defaults and straightforward customization options.

## Compatibility

- Ember.js v4.8 or above
- Ember CLI v4.8 or above
- Node.js v18 or above

## Installation

To install this addon, simply run the following command in your terminal:

```
ember install ember-auth0
```

## Usage

This addon provides an Ember.js service for integrating with Auth0. It leverages the Auth0 SPA SDK to implement features such as login, logout, and session handling. Here's a basic usage guide:

1. Install the addon using the command provided above.
2. Import the service in your application using `import { inject as service } from '@ember/service';`.
3. Use the service in your application like so: `@service auth!: AuthService;`.
4. You can now use the methods provided by the service, such as `login()`, `logout()`, `getUser()`, and `getIsAuthenticated()`.

For more detailed usage instructions, please refer to the service file `auth.ts`.

## Contributing

We welcome contributions to this project! For details on how to contribute, please see the [Contributing](CONTRIBUTING.md) guide.

## License

This project is licensed under the [MIT License](LICENSE.md).
