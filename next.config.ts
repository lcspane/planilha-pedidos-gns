/** @type {import('next').NextConfig} */
const nextConfig = {
    // Adicione a configuração para desabilitar a otimização de fontes do Google
    optimizeFonts: false,
    devIndicators: false
};

// Alterado de "export default" para "module.exports"
module.exports = nextConfig;
