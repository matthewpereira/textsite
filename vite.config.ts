import { defineConfig }  from 'vite'
import react             from '@vitejs/plugin-react-swc'
import dts               from 'vite-plugin-dts';
import viteTsconfigPaths from 'vite-tsconfig-paths';


// https://vitejs.dev/config/
export default defineConfig(({ }) => {

const config = {
    plugins: [react(), dts(), viteTsconfigPaths()],
    base: './',
  }

  return config;
})