"""
Script para generar animaciones WebP fluidas del Maestro Carnicero CANRES:
1. butcher-idle.webp: Respiración orgánica, balanceo suave de la carne y parpadeo natural de ojos.
2. butcher-talking.webp: Movimiento real de mandíbula, apertura de boca con dientes y lengua, flexión de bigote, inclinación de cabeza y gesticulación.
3. butcher-thinking.webp: Movimiento de corte artesanal, cuchillo de chef rebanando carne en la tabla y concentración del carnicero.
"""
import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUTPUT_DIR = 'public/images/butcher'

def warp_organic(arr, displacements):
    """
    Aplica una suma de desplazamientos gaussianos orgánicos 2D a una imagen numpy (H, W, 3).
    displacements: lista de dicts con {'cx', 'cy', 'sx', 'sy', 'dx', 'dy', 'y_min'}
    """
    h, w, _ = arr.shape
    y_coords, x_coords = np.mgrid[0:h, 0:w].astype(np.float32)
    
    total_dx = np.zeros((h, w), dtype=np.float32)
    total_dy = np.zeros((h, w), dtype=np.float32)
    
    for d in displacements:
        cx, cy = d['cx'], d['cy']
        sx, sy = d['sx'], d['sy']
        dx, dy = d.get('dx', 0.0), d.get('dy', 0.0)
        
        weight = np.exp(-((x_coords - cx)**2 / (2 * sx**2) + (y_coords - cy)**2 / (2 * sy**2)))
        if 'y_min' in d:
            weight[y_coords < d['y_min']] = 0.0
        if 'y_max' in d:
            weight[y_coords > d['y_max']] = 0.0
            
        total_dx += weight * dx
        total_dy += weight * dy
        
    src_y = np.clip(y_coords - total_dy, 0, h - 1)
    src_x = np.clip(x_coords - total_dx, 0, w - 1)
    
    y0 = np.floor(src_y).astype(np.int32)
    y1 = np.clip(y0 + 1, 0, h - 1)
    x0 = np.floor(src_x).astype(np.int32)
    x1 = np.clip(x0 + 1, 0, w - 1)
    
    wy = (src_y - y0)[:, :, None]
    wx = (src_x - x0)[:, :, None]
    
    warped = (
        arr[y0, x0] * (1 - wy) * (1 - wx) +
        arr[y1, x0] * wy * (1 - wx) +
        arr[y0, x1] * (1 - wy) * wx +
        arr[y1, x1] * wy * wx
    )
    return np.clip(warped, 0, 255).astype(np.uint8)

def draw_blink(img, progress):
    """
    Dibuja párpados cerrándose de forma orgánica sobre los ojos.
    progress: 0.0 (abiertos) a 1.0 (completamente cerrados)
    """
    if progress <= 0.05:
        return img
        
    res = img.copy()
    draw = ImageDraw.Draw(res, 'RGBA')
    
    # Left eye: cx=210, cy=185, rx=18, ry=14
    # Right eye: cx=260, cy=185, rx=18, ry=14
    for cx, cy in [(210, 185), (260, 185)]:
        drop_h = int(14 * progress)
        top = cy - 14
        bottom = cy - 14 + drop_h * 2
        
        # Sombra y tono de piel del párpado
        alpha = int(240 * progress)
        draw.ellipse([cx - 16, top, cx + 16, min(bottom, cy + 12)], fill=(228, 168, 128, alpha))
        
        # Pestañas / pliegue cuando está muy cerrado
        if progress > 0.6:
            draw.arc([cx - 16, cy - 6, cx + 16, cy + 8], start=20, end=160, fill=(75, 40, 30, alpha), width=2)
            
    return res

def draw_mouth_cavity(img, opening_px):
    """
    Dibuja la apertura de la boca bajo el bigote con dientes superiores y lengua.
    opening_px: altura de apertura en píxeles (0 a 14)
    """
    if opening_px <= 1.0:
        return img
        
    res = img.copy()
    draw = ImageDraw.Draw(res, 'RGBA')
    
    # Boca ubicada bajo el centro del bigote: cx=250, cy=252
    cx, cy = 250, 252
    w_mouth = int(24 + opening_px * 2.5)
    h_mouth = int(opening_px * 1.6)
    
    # Cavidad oscura de la boca
    draw.ellipse(
        [cx - w_mouth, cy - h_mouth // 2, cx + w_mouth, cy + h_mouth],
        fill=(50, 12, 16, 250)
    )
    
    # Dientes superiores (arco marfil)
    if opening_px > 3.0:
        teeth_w = int(w_mouth * 0.7)
        teeth_h = min(5, int(opening_px * 0.5))
        draw.rounded_rectangle(
            [cx - teeth_w, cy - h_mouth // 2, cx + teeth_w, cy - h_mouth // 2 + teeth_h],
            radius=2,
            fill=(248, 244, 238, 250)
        )
        
    # Lengua inferior (tono rosa suave)
    if opening_px > 4.0:
        tongue_w = int(w_mouth * 0.65)
        tongue_h = int(opening_px * 0.5)
        draw.ellipse(
            [cx - tongue_w, cy + h_mouth // 2 - tongue_h, cx + tongue_w, cy + h_mouth // 2 + 2],
            fill=(195, 85, 90, 240)
        )
        
    return res

def generate_idle_animation(base_path, out_path):
    print("Generando butcher-idle.webp...")
    base_img = Image.open(base_path).convert('RGB')
    arr = np.array(base_img, dtype=np.float32)
    
    frames = []
    num_frames = 16
    
    for i in range(num_frames):
        t = (2 * math.pi * i) / num_frames
        
        # Respiración del pecho y hombros (Y: 380)
        breath_dy = math.sin(t) * 2.5
        
        # Balanceo suave del bistec en las manos (Y: 500)
        steak_dy = math.sin(t + 0.5) * 2.0
        steak_dx = math.cos(t) * 1.0
        
        # Leve balanceo de la cabeza (Y: 200)
        head_dy = math.sin(t * 0.5) * 0.8
        head_dx = math.cos(t * 0.5) * 0.6
        
        displacements = [
            # Pecho y hombros
            {'cx': 250.0, 'cy': 380.0, 'sx': 140.0, 'sy': 60.0, 'dy': breath_dy, 'dx': 0.0},
            # Manos y carne
            {'cx': 250.0, 'cy': 520.0, 'sx': 160.0, 'sy': 70.0, 'dy': steak_dy, 'dx': steak_dx},
            # Cabeza
            {'cx': 250.0, 'cy': 200.0, 'sx': 110.0, 'sy': 90.0, 'dy': head_dy, 'dx': head_dx, 'y_max': 340.0},
        ]
        
        warped_arr = warp_organic(arr, displacements)
        frame_img = Image.fromarray(warped_arr).convert('RGBA')
        
        # Parpadeo natural en los cuadros 8 y 9
        blink_progress = 0.0
        if i == 8:
            blink_progress = 0.7
        elif i == 9:
            blink_progress = 1.0
        elif i == 10:
            blink_progress = 0.3
            
        frame_img = draw_blink(frame_img, blink_progress)
        frames.append(frame_img)
        
    frames[0].save(
        out_path,
        save_all=True,
        append_images=frames[1:],
        duration=100,
        loop=0,
        lossless=False,
        quality=92,
        method=6
    )
    print(f"-> Guardado exitosamente: {out_path} ({len(frames)} frames)")

def generate_talking_animation(base_path, out_path):
    print("Generando butcher-talking.webp...")
    base_img = Image.open(base_path).convert('RGB')
    arr = np.array(base_img, dtype=np.float32)
    
    # Secuencia de aperturas de boca (visemas simulando palabras)
    openings = [0.0, 3.5, 7.0, 11.5, 8.0, 3.0, 0.5, 5.0, 10.0, 13.0, 9.0, 4.0, 1.0, 0.0]
    num_frames = len(openings)
    frames = []
    
    for i, op in enumerate(openings):
        t = (2 * math.pi * i) / num_frames
        
        # Movimiento de mandíbula hacia abajo
        jaw_dy = op * 0.95
        
        # El bigote se mueve un 35% de la mandíbula
        mustache_dy = op * 0.35
        
        # Inclinación / cabeceo al enfatizar sílabas
        head_nod = math.sin(t * 2) * 2.2
        head_tilt = math.cos(t) * 1.5
        
        # Gesto expresivo con las manos y la carne
        steak_dy = math.sin(t * 1.5) * 3.5
        steak_dx = math.cos(t) * 1.8
        
        displacements = [
            # Mandíbula y barbilla
            {'cx': 250.0, 'cy': 285.0, 'sx': 45.0, 'sy': 25.0, 'dy': jaw_dy, 'dx': 0.0, 'y_min': 252.0},
            # Flexión del bigote
            {'cx': 250.0, 'cy': 240.0, 'sx': 60.0, 'sy': 18.0, 'dy': mustache_dy, 'dx': 0.0, 'y_min': 230.0, 'y_max': 256.0},
            # Cabeceo general
            {'cx': 250.0, 'cy': 190.0, 'sx': 110.0, 'sy': 90.0, 'dy': head_nod, 'dx': head_tilt, 'y_max': 340.0},
            # Gesto de manos presentando la carne
            {'cx': 250.0, 'cy': 520.0, 'sx': 160.0, 'sy': 70.0, 'dy': steak_dy, 'dx': steak_dx},
        ]
        
        warped_arr = warp_organic(arr, displacements)
        frame_img = Image.fromarray(warped_arr).convert('RGBA')
        
        # Si la boca está abierta, dibujamos la cavidad interior
        frame_img = draw_mouth_cavity(frame_img, op)
        
        # Parpadeo expresivo en el cuadro 10 y 11
        blink_progress = 0.0
        if i == 10:
            blink_progress = 0.85
        elif i == 11:
            blink_progress = 0.4
            
        frame_img = draw_blink(frame_img, blink_progress)
        frames.append(frame_img)
        
    frames[0].save(
        out_path,
        save_all=True,
        append_images=frames[1:],
        duration=85,
        loop=0,
        lossless=False,
        quality=92,
        method=6
    )
    print(f"-> Guardado exitosamente: {out_path} ({len(frames)} frames)")

def generate_thinking_animation(base_path, out_path):
    print("Generando butcher-thinking.webp...")
    base_img = Image.open(base_path).convert('RGB')
    arr = np.array(base_img, dtype=np.float32)
    
    num_frames = 12
    frames = []
    
    for i in range(num_frames):
        t = (2 * math.pi * i) / num_frames
        
        # Cabeceo concentrado hacia abajo
        head_dy = math.sin(t) * 2.5
        head_dx = math.cos(t) * 1.0
        
        # Movimiento de corte en la tabla (manos y antebrazos)
        # Dos golpes de corte rítmicos por ciclo:
        cut_phase = (i % 6) / 6.0
        # Golpe rápido hacia abajo y retorno elástico
        cut_dy = -6.0 if cut_phase < 0.3 else 3.0 if cut_phase < 0.6 else 0.0
        
        displacements = [
            # Cabeza mirando abajo en concentración
            {'cx': 250.0, 'cy': 220.0, 'sx': 110.0, 'sy': 90.0, 'dy': head_dy, 'dx': head_dx, 'y_max': 380.0},
            # Brazos y manos ejecutando el corte
            {'cx': 350.0, 'cy': 620.0, 'sx': 120.0, 'sy': 80.0, 'dy': cut_dy, 'dx': -1.5, 'y_min': 500.0},
            # Respiración de espalda
            {'cx': 250.0, 'cy': 400.0, 'sx': 140.0, 'sy': 60.0, 'dy': math.sin(t) * 1.8},
        ]
        
        warped_arr = warp_organic(arr, displacements)
        frame_img = Image.fromarray(warped_arr).convert('RGBA')
        
        # Dibujar cuchillo de chef rebanando carne en la tabla
        draw = ImageDraw.Draw(frame_img, 'RGBA')
        # Cuchillo ubicado cerca de la mano derecha y la tabla (x ~ 320..420, y ~ 640..720)
        knife_y = 660 + int(cut_dy * 1.5)
        # Hoja metálica brillante de cuchillo
        draw.polygon(
            [(340, knife_y), (410, knife_y - 25), (415, knife_y - 18), (345, knife_y + 12)],
            fill=(220, 225, 230, 220),
            outline=(160, 170, 180, 240)
        )
        # Brillo reflejo en el filo
        draw.line([(345, knife_y + 5), (405, knife_y - 18)], fill=(255, 255, 255, 240), width=1)
        # Mango de madera de cuchillo
        draw.line([(410, knife_y - 25), (435, knife_y - 35)], fill=(90, 50, 30, 255), width=7)
        
        # Destello de corte si golpea la tabla
        if cut_dy > 1.0:
            draw.line([(335, knife_y + 10), (355, knife_y + 15)], fill=(255, 255, 255, 200), width=2)
            
        frames.append(frame_img)
        
    frames[0].save(
        out_path,
        save_all=True,
        append_images=frames[1:],
        duration=90,
        loop=0,
        lossless=False,
        quality=92,
        method=6
    )
    print(f"-> Guardado exitosamente: {out_path} ({len(frames)} frames)")

if __name__ == '__main__':
    presenting = os.path.join(OUTPUT_DIR, 'butcher-presenting.jpg')
    thinking = os.path.join(OUTPUT_DIR, 'butcher-thinking.jpg')
    
    generate_idle_animation(presenting, os.path.join(OUTPUT_DIR, 'butcher-idle.webp'))
    generate_talking_animation(presenting, os.path.join(OUTPUT_DIR, 'butcher-talking.webp'))
    generate_thinking_animation(thinking, os.path.join(OUTPUT_DIR, 'butcher-thinking.webp'))
    print("\n¡Todas las animaciones WebP generadas con éxito!")
