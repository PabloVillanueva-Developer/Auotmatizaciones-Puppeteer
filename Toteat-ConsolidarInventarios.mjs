import fs from 'fs/promises';
import path from 'path';
import xlsx from 'xlsx';

// Ruta donde se guardarán los archivos consolidados
let rutaCarpetaDestino = 'C:/Users/PVillanueva/Desktop/Proyectos en Proceso/Descargas Todos Locales Toteat/Carpeta Destino/XLSX - Convertir Totet Inventarios a Cosolidado';

console.log('Consolidación en proceso. Por favor, espere...');

const procesarArchivosExcel = async () => {
  try {
    const archivos = await fs.readdir(rutaCarpetaDestino);

    // Estructura de datos para almacenar información de los encabezados
    const infoEncabezados = {
      encabezadoPrimeraFila: new Set(),
      encabezadosSegundaFila: new Set(),
    };

    const datosACopiar = {
      columnasA: [],
      columnasB: [],
      columnasC: [],
    };

    for (const archivo of archivos) {
      if (archivo.endsWith('.xls')) {
        const filePath = path.join(rutaCarpetaDestino, archivo);

        try {
          // Leer el archivo Excel
          const workbook = xlsx.readFile(filePath);

          // Obtener todas las hojas del libro
          const sheetNames = workbook.SheetNames;

          // Iterar sobre las hojas
          sheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];

            // Obtener el encabezado completo de la primera fila
            const celdasPrimeraFila = xlsx.utils.sheet_to_json(worksheet, { range: 'A1:Z1', header: 1 })[0];
            celdasPrimeraFila.forEach(encabezado => infoEncabezados.encabezadoPrimeraFila.add(encabezado));

            // Obtener encabezados de la segunda fila
            const celdasSegundaFila = xlsx.utils.sheet_to_json(worksheet, { range: 'A2:Z2', header: 1 })[0];
            celdasSegundaFila.forEach(encabezado => infoEncabezados.encabezadosSegundaFila.add(encabezado));

            // Obtener datos para columnas A, B y C
            const datosColumnaA = xlsx.utils.sheet_to_json(worksheet, { range: 'A:A', header: 1 });
            const datosColumnaB = xlsx.utils.sheet_to_json(worksheet, { range: 'B:B', header: 1 });
            const datosColumnaC = xlsx.utils.sheet_to_json(worksheet, { range: 'C:C', header: 1 });

            datosACopiar.columnasA = datosACopiar.columnasA.concat(datosColumnaA);
            datosACopiar.columnasB = datosACopiar.columnasB.concat(datosColumnaB);
            datosACopiar.columnasC = datosACopiar.columnasC.concat(datosColumnaC);
          });
        } catch (error) {
          console.error(`Error al leer el archivo ${archivo}:`, error.message);
        }
      }
    }

    // Convertir sets a arrays y ordenarlos
    const encabezadosPrimeraFila = Array.from(infoEncabezados.encabezadoPrimeraFila).sort();
    const encabezadosSegundaFila = Array.from(infoEncabezados.encabezadosSegundaFila).sort();

    // Determinar la cantidad de elementos en el encabezado 1
    const cantidadElementosEncabezado1 = encabezadosSegundaFila.length;

    // Crear nuevo libro
    const nuevoLibro = xlsx.utils.book_new();
    const nuevaHoja = xlsx.utils.aoa_to_sheet([]);

    // Iterar sobre cada encabezado único de la primera fila
    encabezadosPrimeraFila.forEach((elementoEncabezado1, i) => {
      // Crear una fila con los encabezados actualizados
      const primeraFila = [elementoEncabezado1];

      // Añadir los demás elementos del encabezado 1
      const segundaFila = [];
      encabezadosSegundaFila.forEach(encabezado2 => {
        segundaFila.push(encabezado2.replace(/\{ELEMENTO\}/g, elementoEncabezado1));
      });

      // Añadir la fila 1 al libro
      xlsx.utils.sheet_add_aoa(nuevaHoja, [primeraFila], { origin: { r: 0, c: i * cantidadElementosEncabezado1 + 4 } });

      // Añadir la segunda fila
      xlsx.utils.sheet_add_aoa(nuevaHoja, [segundaFila], { origin: { r: 1, c: i * cantidadElementosEncabezado1 + 4 } });

      // Combinar celdas en la primera fila para el siguiente elemento del encabezado 1
      nuevaHoja['!merges'] = nuevaHoja['!merges'] || [];
      const celdaInicio = xlsx.utils.encode_cell({ r: 0, c: i * cantidadElementosEncabezado1 + 4 });
      const celdaFin = xlsx.utils.encode_cell({ r: 0, c: (i + 1) * cantidadElementosEncabezado1 + 3 });
      nuevaHoja['!merges'].push({ s: xlsx.utils.decode_cell(celdaInicio), e: xlsx.utils.decode_cell(celdaFin) });
    });

    // Añadir datos a partir de la columna E
    for (let i = 0; i < datosACopiar.columnasA.length; i++) {
      const fila = [
        datosACopiar.columnasA[i],
        datosACopiar.columnasB[i],
        datosACopiar.columnasC[i],
        ...Array.from({ length: encabezadosPrimeraFila.length * cantidadElementosEncabezado1 - 3 }).fill(''),
      ];
      xlsx.utils.sheet_add_aoa(nuevaHoja, [fila], { origin: { r: 2 + i, c: 1 } });
    }

    // Añadir la hoja al libro
    xlsx.utils.book_append_sheet(nuevoLibro, nuevaHoja, 'Hoja1');

    // Escribir el nuevo libro a un archivo
    const nuevoLibroFilePath = path.join(rutaCarpetaDestino, 'NuevoLibro.xlsx');
    xlsx.writeFile(nuevoLibro, nuevoLibroFilePath);

    console.log(`El nuevo libro ha sido creado en: ${nuevoLibroFilePath}`);
  } catch (error) {
    console.error('Error al procesar los archivos:', error.message);
  }
};





// Función para procesar archivos y llenar datos en las columnas B, C y D
const procesarArchivosExcelProductos = async (hojaExistente) => {
  try {
    const archivos = await fs.readdir(rutaCarpetaDestino);
      for (const archivo of archivos) {   
        if (archivo.endsWith('.xls')) {
          const filePath = path.join(rutaCarpetaDestino, archivo);

          try {
            // Leer el archivo Excel
                const workbook = xlsx.readFile(filePath);
                // Obtener todas las hojas del libro
              const sheetNames = workbook.SheetNames;

              // Iterar sobre las hojas
              sheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const primeraColumna = xlsx.utils.sheet_to_json(worksheet, { range: 'A2:A5000', header: 3 })
                const segundaColumna = xlsx.utils.sheet_to_json(worksheet, { range: 'B2:B5000', header: 3 })
                const terceraColumna = xlsx.utils.sheet_to_json(worksheet, { range: 'C2:C5000', header: 3 })

              })
              
          }catch(error) {console.error('mala suerte', error)}
        }
      }
  }catch(error) {console.error('mala suerte', error)}
}





procesarArchivosExcel();
procesarArchivosExcelProductos()



// TIENE QUE LOGRAR TOMAR LAS COLUMNAS A B y C ORIGEN PARA VOLCAR EN B C Y Destino
// LOGRA LEER LOS ARCHIVO DE ORIGEN PERO NO VOLCAR EN DESTINO las columnas que faltan.
// Si se logra eso ya luego es lograr que itere la info para completar los campos.