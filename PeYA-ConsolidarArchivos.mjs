import fs from 'fs/promises';
import path from 'path';
import xlsx from 'xlsx';
import { carpetaDestinoPeYA } from "./datosUsuario.mjs";

export const consolidarArchivosPeYA = async () => {
// Ruta donde se guardará el libro consolidado
const rutaLibroDestino = 'C:/Users/PVillanueva/Desktop/Proyectos en Proceso/Descargas Todos Locales Toteat/Carpeta Destino/PeYA - Consolidador Relacion Ventas/';

console.log('Consolidacion en proceso. Por favor espere...')
// Crear un nuevo libro (workbook) con una hoja en blanco DETALLE
const nuevoLibro = xlsx.utils.book_new();
const nuevaHojaDetalle = xlsx.utils.aoa_to_sheet([['Referencia', 'Número de pedido', 'Sucursal', 'Fecha del Pedido', 'Monto de Venta', 'Costo de Envío', 'Descuentos PedidosYa a cobrar']]);
xlsx.utils.book_append_sheet(nuevoLibro, nuevaHojaDetalle, 'DETALLE');

// Obtener la lista de archivos en la carpeta de destino
const archivos = await fs.readdir(carpetaDestinoPeYA);
// Filtrar el archivo de destino para que no se incluya en la lista a iterar
const archivosFiltrados = archivos.filter((archivo) => archivo !== 'ARCHIVO CONSOLIDADO.xlsx');

// Iniciar contador de tiempo
const tiempoInicio = process.hrtime();

// Iterar sobre cada archivo en la carpeta
for (const elemento of archivosFiltrados) {
  // Construir la ruta completa del archivo
  const rutaArchivo = path.join(carpetaDestinoPeYA, elemento);

  // Leer el archivo Excel
  const elementoOrigen = xlsx.readFile(rutaArchivo);

  // Obtener el nombre completo del archivo (sin extensión)
  const nombreCompletoArchivo = path.parse(elemento).name;

  // Iterar sobre cada hoja en el archivo de origen
  for (const nombreHoja in elementoOrigen.Sheets) {
    const hojaLeida = elementoOrigen.Sheets[nombreHoja];
    const datosHoja = xlsx.utils.sheet_to_json(hojaLeida, { header: 1, blankrows: false });

    // Agregar la referencia del archivo a cada fila de datos
    datosHoja.forEach((fila, index) => {
      if (nombreHoja === 'Resumen') {
        // Para la hoja 'Resumen', utilizar el nombre completo del archivo en todas las filas
        fila.unshift(nombreCompletoArchivo);
      } else {
        // Para otras hojas, utilizar las primeras 9 letras del nombre del archivo
        fila.unshift(elemento.slice(0, 9));
      }
    });

    // Si la hoja ya existe en el libro consolidado, consolidar debajo
    if (nuevoLibro.SheetNames.indexOf(nombreHoja) >= 0) {
      const hojaExistente = nuevoLibro.Sheets[nombreHoja];
      const datosHojaExistente = xlsx.utils.sheet_to_json(hojaExistente, { header: 1, blankrows: false });

      // Consolidar los datos debajo
      const datosConsolidados = datosHojaExistente.concat(datosHoja);
      nuevoLibro.Sheets[nombreHoja] = xlsx.utils.aoa_to_sheet(datosConsolidados);
    } else {
      // Si la hoja no existe, crearla en el libro consolidado
      const nuevaHojaConDatos = xlsx.utils.aoa_to_sheet(datosHoja);
      xlsx.utils.book_append_sheet(nuevoLibro, nuevaHojaConDatos, nombreHoja);
    }
  }
}

// Finalizar contador de tiempo
const tiempoFin = process.hrtime(tiempoInicio);
const tiempoTranscurrido = tiempoFin[0] + tiempoFin[1] / 1e9; // Convertir a segundos

// Especificar el nombre del archivo de salida
const nombreArchivo = 'ARCHIVO CONSOLIDADO.xlsx';
const rutaNuevoArchivo = path.join(rutaLibroDestino, nombreArchivo);

// Intentar escribir el libro consolidado en un archivo nuevamente
try {
  // Escribir el libro destino en el archivo de salida
  xlsx.writeFile(nuevoLibro, rutaNuevoArchivo);
  console.log(`Proceso completado. Revisa el archivo "${rutaNuevoArchivo}".`);
  console.log(`Tiempo transcurrido: ${tiempoTranscurrido.toFixed(2)} segundos.`);
} catch (error) {
  console.error('Error al escribir en el archivo:', error.message);
  console.error(error);
}
}

consolidarArchivosPeYA()