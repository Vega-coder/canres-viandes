import Swal from 'sweetalert2';

// Alertas con la estética de la marca.
const base = Swal.mixin({
    background: '#F8F4EE',
    color: '#0B0B0B',
    confirmButtonColor: '#0B0B0B',
    cancelButtonColor: '#8C7A70',
    customClass: { title: 'font-display' },
});

export const toast = (title, icon = 'success') =>
    Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon,
        title,
        timer: 2200,
        showConfirmButton: false,
        background: '#0B0B0B',
        color: '#F8F4EE',
        iconColor: '#C6A15B',
    });

export const toastSuccess = (title) => toast(title, 'success');

export const alertError = (title, text) => base.fire({ icon: 'error', title, text, iconColor: '#9C3B3B' });

export const confirmAction = async ({
    title = '¿Estás seguro?',
    text = '',
    confirmButtonText = 'Confirmar',
    cancelButtonText = 'Cancelar',
    icon = 'question',
} = {}) => {
    const res = await base.fire({
        icon,
        title,
        text,
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText,
    });
    return res.isConfirmed;
};

export default base;
