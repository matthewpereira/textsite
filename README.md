# Personal website

This is an experiment exploring a keyboard-driven, minimal gallery website.

## Built on React + TypeScript + Vite

## Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Auth0 account (for authentication)
- Imgur API credentials (for image hosting)

### Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your credentials:
   - **Auth0**: Get credentials from [Auth0 Dashboard](https://manage.auth0.com/)
     - `VITE_AUTH0_DOMAIN`: Your Auth0 tenant domain
     - `VITE_AUTH0_CLIENT_ID`: Your Auth0 application client ID
     - `VITE_AUTH0_AUDIENCE`: Your API identifier

   - **Imgur**: Get Client ID from [Imgur API](https://api.imgur.com/oauth2/addclient)
     - `VITE_IMGUR_CLIENT_ID`: Your Imgur Client ID

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production

```bash
npm run build
npm run preview  # Preview the production build locally
```

### Deployment

```bash
npm run deploy  # Deploys to GitHub Pages
```

## Security Note

**Never commit the `.env` file to version control.** It contains sensitive credentials. The `.env.example` file is provided as a template.