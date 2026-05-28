import os
import json
import re
from PIL import Image
import cloudinary
import cloudinary.uploader

# ==========================================
# CONFIGURACIÓN DE CLOUDINARY (Pega tus datos aquí)
# ==========================================
cloudinary.config(
  cloud_name = 'djeljniac',
  api_key = '499869344326849',
  api_secret = '2vdQEQYQvlUV4ZENBeGqdW3LTiA',
  secure = True
)

# ==========================================
# CONFIGURACIÓN DE RUTAS
# ==========================================
# Carpeta donde están tus imágenes originales
INPUT_FOLDER = r'E:\DDDD\Amplify_Limpio\assets\img' 

# Carpeta temporal para guardar los WebP antes de subir
OUTPUT_FOLDER = r'E:\DDDD\Amplify_Limpio\imagenes_webp'

# Crear carpeta de salida si no existe
if not os.path.exists(OUTPUT_FOLDER):
    os.makedirs(OUTPUT_FOLDER)

# Extensiones válidas
VALID_EXTENSIONS = ('.png', '.jpg', '.jpeg')

def obtener_categoria(nombre_archivo):
    """Asigna la categoría basada en el nombre del archivo."""
    nombre_lower = nombre_archivo.lower()
    if 'retoque' in nombre_lower:
        return 'retoque'
    elif 'disenopublicitario' in nombre_lower or 'diseñopublicitario' in nombre_lower:
        return 'disenopublicitario'
    elif 'fotomontaje' in nombre_lower:
        return 'fotomontaje'
    return 'general' # Por defecto si no coincide ninguna

def obtener_grupo(nombre_base):
    """
    Agrupa eliminando los números al final del nombre.
    Ejemplo: 'women1' -> 'women', 'women2' -> 'women'
    """
    return re.sub(r'\d+$', '', nombre_base).strip()

def procesar_imagenes():
    datos_json = {}

    for archivo in os.listdir(INPUT_FOLDER):
        if not archivo.lower().endswith(VALID_EXTENSIONS):
            continue

        ruta_original = os.path.join(INPUT_FOLDER, archivo)
        nombre_base = os.path.splitext(archivo)[0]
        
        # 1. Extraer datos del nombre
        categoria = obtener_categoria(nombre_base)
        grupo = obtener_grupo(nombre_base)

        # 2. Procesar imagen (Convertir a WebP y comprimir)
        ruta_webp = os.path.join(OUTPUT_FOLDER, f"{nombre_base}.webp")
        
        with Image.open(ruta_original) as img:
            # Obtener dimensiones originales
            ancho, alto = img.size
            dimensiones = f"{ancho}x{alto}"
            
            # Convertir a RGB si es necesario (para evitar errores con PNGs transparentes al pasar a WebP)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")

            # Guardar como WebP. 
            # quality=90 mantiene excelente calidad. method=6 aplica máxima compresión de tamaño.
            img.save(ruta_webp, "webp", quality=90, method=6)
            print(f"✅ Convertida: {archivo} -> {nombre_base}.webp")

        # 3. Subir a Cloudinary
        print(f"☁️ Subiendo {nombre_base}.webp a Cloudinary...")
        respuesta_cloudinary = cloudinary.uploader.upload(
            ruta_webp, 
            folder="mi_portafolio", # Puedes cambiar la carpeta de destino en Cloudinary
            public_id=nombre_base
        )
        url_final = respuesta_cloudinary.get('secure_url')

        # 4. Estructurar los datos para el JSON
        datos_imagen = {
            "nombre": nombre_base,
            "dimensiones": dimensiones,
            "categoria": categoria,
            "url": url_final
        }

        # Agrupar en el diccionario principal
        if grupo not in datos_json:
            datos_json[grupo] = []
        
        datos_json[grupo].append(datos_imagen)

    # 5. Guardar el JSON final
    with open('portfolio_data.json', 'w', encoding='utf-8') as f:
        json.dump(datos_json, f, indent=4, ensure_ascii=False)
    
    print("\n🎉 ¡Proceso terminado! Se ha generado el archivo 'portfolio_data.json'.")

if __name__ == '__main__':
    procesar_imagenes()