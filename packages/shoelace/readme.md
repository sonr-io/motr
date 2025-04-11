# Sonr UI Components

> A specialized fork of [Shoelace](https://github.com/shoelace-style/shoelace) customized for the [Sonr Network](https://sonr.io/), focusing on cryptocurrency and blockchain interfaces.

A tailored web components library for blockchain applications.

- Custom crypto-focused icon library 🪙
- Sonr design system integration 🎨
- Specialized components for blockchain UIs 🔗
- Works with all frameworks 🧩
- Built with accessibility in mind ♿️
- Open source 😸

Originally designed by [Cory LaViska](https://twitter.com/claviska), customized for Sonr Network.

---

Documentation: [docs.sonr.io/design](https://docs.sonr.io/components)

Source: [github.com/onsonr/styles](https://github.com/sonr-io/components)

Twitter: [@sonr_io](https://twitter.com/sonr_io)

---

## Shoemakers 🥾

Shoemakers, or "Shoelace developers," can use this documentation to learn how to build Shoelace from source. You will need Node >= 14.17 to build and run the project locally.

**You don't need to do any of this to use Shoelace!** This page is for people who want to contribute to the project, tinker with the source, or create a custom build of Shoelace.

If that's not what you're trying to do, the [documentation website](https://shoelace.style) is where you want to be.

### How are Sonr components built?

Components are built with [LitElement](https://lit-element.polymer-project.org/) for reactive web components, integrated with Sonr's design system and custom icon libraries specifically created for cryptocurrency and blockchain interfaces. The build process uses [esbuild](https://esbuild.github.io/) for efficient bundling.

### Forking the Repo

Start by [forking the repo](https://github.com/shoelace-style/shoelace/fork) on GitHub, then clone it locally and install dependencies.

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/shoelace
cd shoelace
npm install
```

### Developing

Once you've cloned the repo, run the following command.

```bash
npm start
```

This will spin up the dev server. After the initial build, a browser will open automatically. There is currently no hot module reloading (HMR), as browser's don't provide a way to reregister custom elements, but most changes to the source will reload the browser automatically.

### Building

To generate a production build, run the following command.

```bash
npm run build
```

### Creating New Components

To scaffold a new component, run the following command, replacing `sl-tag-name` with the desired tag name.

```bash
npm run create sl-tag-name
```

This will generate a source file, a stylesheet, and a docs page for you. When you start the dev server, you'll find the new component in the "Components" section of the sidebar.

## License

Shoelace was created by [Cory LaViska](https://twitter.com/claviska) and is available under the terms of the MIT license.

Whether you're building Shoelace or building something _with_ Shoelace — have fun creating! 🥾
