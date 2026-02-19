export const resolveAssetUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace(/\/api$/, '');

    // Ensure the URL starts with a slash
    const formattedUrl = url.startsWith('/') ? url : `/${url}`;

    return `${baseUrl}${formattedUrl}`;
};
