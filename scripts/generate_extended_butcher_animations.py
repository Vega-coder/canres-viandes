import os
import math
import numpy as np
from PIL import Image

OUTPUT_DIR = 'public/images/butcher'
TARGET_SIZE = (500, 889)

def warp_organic(arr, displacements):
    """
    Aplica una suma de desplazamientos gaussianos orgánicos 2D a una imagen numpy (H, W, 3).
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

def generate_sausages_animation(base_path, out_path):
    print("Generando butcher-sausages.webp (Acción: Presumiendo chorizos artesanales)...")
    base_img = Image.open(base_path).convert('RGB')
    if base_img.size != TARGET_SIZE:
        base_img = base_img.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
    arr = np.array(base_img, dtype=np.float32)
    
    frames = []
    num_frames = 16
    
    for i in range(num_frames):
        t = (2 * math.pi * i) / num_frames
        
        # Respiración natural de tórax
        breath_dy = math.sin(t) * 2.8
        
        # Balanceo orgulloso de las salchichas en las manos
        sausage_dy = math.sin(t + 0.3) * 3.5
        sausage_dx = math.cos(t) * 1.5
        
        # Leve cabeceo de satisfacción y mirada cálida
        head_dy = math.sin(t * 0.5) * 1.0
        head_dx = math.cos(t * 0.5) * 0.8
        
        # Elevación cálida y orgánica de pómulos/sonrisa
        smile_dy = -1.6 * max(0.0, math.sin(t))
        
        displacements = [
            # Pecho y hombros
            {'cx': 250.0, 'cy': 380.0, 'sx': 140.0, 'sy': 60.0, 'dy': breath_dy, 'dx': 0.0},
            # Salchichas y manos
            {'cx': 250.0, 'cy': 520.0, 'sx': 160.0, 'sy': 90.0, 'dy': sausage_dy, 'dx': sausage_dx},
            # Cabeza
            {'cx': 250.0, 'cy': 200.0, 'sx': 110.0, 'sy': 90.0, 'dy': head_dy, 'dx': head_dx, 'y_max': 340.0},
            # Sonrisa y mejillas
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
    print(f"-> Guardado: {out_path} ({len(frames)} frames)")

def generate_ok_animation(base_path, out_path):
    print("Generando butcher-ok.webp (Acción: Corte AAA y gesto de aprobación OK)...")
    base_img = Image.open(base_path).convert('RGB')
    if base_img.size != TARGET_SIZE:
        base_img = base_img.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
    arr = np.array(base_img, dtype=np.float32)
    
    frames = []
    num_frames = 16
    
    for i in range(num_frames):
        t = (2 * math.pi * i) / num_frames
        
        # Respiración
        breath_dy = math.sin(t) * 2.6
        
        # Gesto enfático con la mano del OK
        ok_hand_dy = math.sin(t * 1.5) * 3.0
        ok_hand_dx = math.cos(t) * 1.2
        
        # Mano con la carne en la tabla
        meat_dy = math.sin(t + 0.4) * 2.0
        
        # Inclinación segura y sonriente
        head_dy = math.sin(t * 0.5) * 0.9
        head_dx = math.cos(t * 0.5) * 0.7
        
        # Elevación orgánica de pómulos/sonrisa
        smile_dy = -1.6 * max(0.0, math.sin(t))
        
        displacements = [
            # Pecho y hombros
            {'cx': 250.0, 'cy': 380.0, 'sx': 140.0, 'sy': 60.0, 'dy': breath_dy, 'dx': 0.0},
            # Mano derecha (Gesto OK)
            {'cx': 340.0, 'cy': 460.0, 'sx': 90.0, 'sy': 70.0, 'dy': ok_hand_dy, 'dx': ok_hand_dx},
            # Mano izquierda con el Ribeye
            {'cx': 180.0, 'cy': 530.0, 'sx': 110.0, 'sy': 80.0, 'dy': meat_dy, 'dx': 0.0},
            # Cabeza
            {'cx': 250.0, 'cy': 200.0, 'sx': 110.0, 'sy': 90.0, 'dy': head_dy, 'dx': head_dx, 'y_max': 340.0},
            # Sonrisa y mejillas
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
    print(f"-> Guardado: {out_path} ({len(frames)} frames)")

def generate_welcome_animation(base_path, out_path):
    print("Generando butcher-welcome.webp (Acción: Bienvenida con brazos abiertos)...")
    base_img = Image.open(base_path).convert('RGB')
    if base_img.size != TARGET_SIZE:
        base_img = base_img.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
    arr = np.array(base_img, dtype=np.float32)
    
    frames = []
    num_frames = 16
    
    for i in range(num_frames):
        t = (2 * math.pi * i) / num_frames
        
        # Respiración amplia y acogedora
        breath_dy = math.sin(t) * 3.0
        
        # Brazos abiertos acogiendo al cliente
        arms_dy = math.sin(t + 0.2) * 3.2
        arms_dx = math.cos(t) * 1.8
        
        # Cabeza sonriendo hacia adelante
        head_dy = math.sin(t * 0.5) * 1.2
        head_dx = math.cos(t * 0.5) * 0.6
        
        # Elevación orgánica de pómulos/sonrisa
        smile_dy = -1.8 * max(0.0, math.sin(t))
        
        displacements = [
            # Pecho y torso
            {'cx': 250.0, 'cy': 380.0, 'sx': 140.0, 'sy': 60.0, 'dy': breath_dy, 'dx': 0.0},
            # Brazos y manos abiertos
            {'cx': 140.0, 'cy': 490.0, 'sx': 110.0, 'sy': 80.0, 'dy': arms_dy, 'dx': -arms_dx},
            {'cx': 360.0, 'cy': 490.0, 'sx': 110.0, 'sy': 80.0, 'dy': arms_dy, 'dx': arms_dx},
            # Cabeza
            {'cx': 250.0, 'cy': 200.0, 'sx': 110.0, 'sy': 90.0, 'dy': head_dy, 'dx': head_dx, 'y_max': 340.0},
            # Sonrisa y mejillas
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
    print(f"-> Guardado: {out_path} ({len(frames)} frames)")

if __name__ == '__main__':
    sausages_src = os.path.join(OUTPUT_DIR, 'butcher-sausages.jpg')
    ok_src = os.path.join(OUTPUT_DIR, 'butcher-ok.jpg')
    welcome_src = os.path.join(OUTPUT_DIR, 'butcher-welcome.jpg')
    
    if os.path.exists(sausages_src):
        generate_sausages_animation(sausages_src, os.path.join(OUTPUT_DIR, 'butcher-sausages.webp'))
    if os.path.exists(ok_src):
        generate_ok_animation(ok_src, os.path.join(OUTPUT_DIR, 'butcher-ok.webp'))
    if os.path.exists(welcome_src):
        generate_welcome_animation(welcome_src, os.path.join(OUTPUT_DIR, 'butcher-welcome.webp'))
        
    print("\n¡Nuevas animaciones WebP generadas con éxito sin parpadeos artificiales!")