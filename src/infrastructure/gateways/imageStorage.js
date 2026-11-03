// Implementaciones de ImageStorage (Cloudinary, Supabase y Local).

const MAX_BYTES = 50 * 1024 * 1024; // Hasta 50 MB para fotos de alta resolución y videos de cortes

const assertMedia = (file) => {
    if (!file?.type?.startsWith('image/') && !file?.type?.startsWith('video/')) {
        throw new Error('El archivo debe ser una imagen o video');
    }
    if (file.size > MAX_BYTES) throw new Error('El archivo no puede pesar más de 50 MB');
};

/** Sube fotos y videos directamente a Cloudinary CDN */
export const createCloudinaryImageStorage = ({ cloudName, uploadPreset } = {}) => ({
    upload: async (file) => {
        assertMedia(file);
        const resolvedCloudName = cloudName || import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME || 'v3zsy3cm';
        const resolvedPreset = uploadPreset || import.meta.env?.VITE_CLOUDINARY_UPLOAD_PRESET || 'canres_preset';

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', resolvedPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${resolvedCloudName}/auto/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || 'Error al subir archivo a Cloudinary');
        }

        const data = await res.json();
        return data.secure_url;
    },
});

/** Sube a Supabase Storage (bucket `product-images`, ver supabase/schema.sql). */
export const createSupabaseImageStorage = (supabase, bucket = 'product-images') => ({
    upload: async (file) => {
        assertMedia(file);
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '31536000', contentType: file.type });
        if (error) throw error;
        return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    },
});

/**
 * Modo demo: reduce la imagen y la guarda como data URL dentro del producto (localStorage).
 * Se redimensiona a 800px para no agotar la cuota del navegador.
 */
export const createDataUrlImageStorage = (maxSize = 800) => ({
    upload: async (file) => {
        assertMedia(file);
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.82);
    },
});
