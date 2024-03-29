import { defineConfig }  from 'vite'
import react             from '@vitejs/plugin-react-swc'
import viteTsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(( {command }) => {

const config = {
    plugins: [react(), viteTsconfigPaths()],
    base: './',
  }

  if (command !== 'serve') {
    config.base = '/textsite'
  }

  return config
})