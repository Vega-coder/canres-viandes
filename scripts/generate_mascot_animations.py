"""
Script para generar animaciones WebP fluidas del Maestro Carnicero CANRES:
1. butcher-idle.webp: Respiración orgánica, balanceo suave de la carne y mirada cálida.
2. butcher-talking.webp: Movimiento real de mandíbula, apertura de boca con dientes y lengua, flexión de bigote, inclinación de cabeza y gesticulación.
3. butcher-thinking.webp: Movimiento de corte artesanal, cuchillo de chef rebanando carne en la tabla y concentración del carnicero.
"""
import os
import math
import numpy as np
from PIL import Image, ImageDraw

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
    
    # 1. Cavidad oral interna oscura y profunda
    draw.chord(
        [cx - w_mouth // 2, cy - 2, cx + w_mouth // 2, cy + h_mouth],
        start=0,
        end=180,
        fill=(40, 10, 10, 245)
    )
    
    # 2. Dientes superiores blancos nacarados
    teeth_h = min(int(opening_px * 0.55), 6)
    if teeth_h > 1:
        teeth_w = int(w_mouth * 0.75)
        draw.chord(
            [cx - teeth_w // 2, cy - 2, cx + teeth_w // 2, cy + teeth_h * 2],
            start=0,
            end=180,
            fill=(245, 245, 240, 245)
        )
        # Líneas de separación sutiles entre dientes frontales
        for sep_x in [-6, 0, 6]:
            draw.line(
                [(cx + sep_x, cy - 1), (cx + sep_x, cy + teeth_h)],
                fill=(180, 175, 170, 160),
                width=1
            )
            
    # 3. Lengua rosada realista en el fondo inferior
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
        
        # Elevación cálida de sonrisa/pómulos
        smile_dy = -1.6 * max(0.0, math.sin(t))
        
        displacements = [
            # Pecho y hombros
            {'cx': 250.0, 'cy': 380.0, 'sx': 140.0, 'sy': 60.0, 'dy': breath_dy, 'dx': 0.0},
            # Manos y carne
            {'cx': 250.0, 'cy': 520.0, 'sx': 160.0, 'sy': 70.0, 'dy': steak_dy, 'dx': steak_dx},
            # Cabeza
            {'cx': 250.0, 'cy': 200.0, 'sx': 110.0, 'sy': 90.0, 'dy': head_dy, 'dx': head_dx, 'y_max': 340.0},
            # Sonrisa orgánica
            {'cx': 200.0, 'cy': 225.0, 'sx': 35.0, 'sy': 20.0, 'dy': smile_dy, 'dx': 0.0},
            {'cx': 275.0, 'cy': 225.0, 'sx': 35.0, 'sy': 20.0, 'dy': smile_dy, 'dx': 0.0},
        ]
        
        warped_arr = warp_organic(arr, displacements)
        frame_img = Image.fromarray(warped_arr).convert('RGBA')
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
        cut_phase = (i % 6) / 6.0
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
