import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path'; // Agrega esta línea
import extractZip from 'extract-zip';
import xlsx from 'xlsx';
import moment from 'moment'; // facilita manejo de fechas
import {localesPeYA} from "./datosUsuario.mjs" 
import { carpetaOrigen } from './datosUsuario.mjs';
import { carpetaDestinoPeYA } from './datosUsuario.mjs';
import { fechaInicioPeYA } from './datosUsuario.mjs';
import { fechaFinalPeYA } from './datosUsuario.mjs';
import { userPeYA } from './datosUsuario.mjs';
import { passwordPeYA } from './datosUsuario.mjs';
let fechaInicio = fechaInicioPeYA
let fechaFinal =  fechaFinalPeYA 
/* import {moverArchivoYCambioNombre} from './funcionesReutilizables.mjs' */

let diaInicio = fechaInicio.slice(0, 2);    
let mesInicio = fechaInicio.slice(2, 4);    
let anioInicio = fechaInicio.slice(4,8);     
let anioIncicio1 = fechaInicio.slice(4,5);     
let anioIncicio2 = fechaInicio.slice(5,6); 
let anioIncicio3 = fechaInicio.slice(6,7);
let anioIncicio4 = fechaInicio.slice(7,8);           
let diaFinal = fechaFinal.slice(0, 2);    
let mesFinal = fechaFinal.slice(2, 4);    
let anioFinal = fechaFinal.slice(4,8);
let anioFinal1 = fechaFinal.slice(4,5);     
let anioFinal2 = fechaFinal.slice(5,6); 
let anioFinal3 = fechaFinal.slice(6,7);
let anioFinal4 = fechaFinal.slice(7,8); 


const startTime = performance.now(); // conteo de tiempo del proceso
const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  defaultViewport: null,
  ignoreHTTPSErrors: true,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
 // creamos una isntancia de pupeteer y configuramos el objeto anonimo en headless false p/Chromium visible
    });
const page = await browser.newPage() //creamos nueva pagina en el navegador



// FUNCION PARA CAPTURAR ERROR Y REINTENTAR EN CASO DE NO ENCONTRAR SELECTOR
const waitForSelectorReintentos = async (page, selector, intentosMax = 3) => {
    let i
      for (i = 0; i < intentosMax; i++) {
          try {
              const elemento = await page.waitForSelector(selector)
              if (elemento) { 
                if(i>0){
                  console.log(`Selector ${selector} detectado con exito`)
                }
              /*  console.log(`Selector encontrado en el intento ${i + 1}.`); */
              return; // Si se encuentra, sal bucle 
              
              }
          }catch {
              console.error (`Intento ${i + 1} - Selector (${selector}) no encontrado. Reintentando...`)
              await page.waitForTimeout(5000);
          }
      }
      await page.reload();
      console.log('Refrescando pagina')
      throw new Error(`Selector "${selector}" no encontrado después de ${i} intentos.`);
  }
  
const iniciarSesion = async () => {
    console.log(`Proceso descarga reportes PeYA Incializado.`)
    console.log("Fecha de inicio seleccionada: " + diaInicio + '-' + mesInicio + '-' + anioInicio)
    console.log("Fecha de finalizacion seleccionada "+ diaFinal + '-' + mesFinal + '-' + anioFinal)
    await page.goto('https://pedidosya.portal.restaurant/login')
    await waitForSelectorReintentos(page, 'input[id="login-email-field"]')
    await page.type('input[id="login-email-field"]', userPeYA)
    await page.type('input[id="login-password-field"]', passwordPeYA)
    await page.click('button[id="button_login"]')
    await waitForSelectorReintentos(page, 'button[data-testid="notification-button"]') 
    console.log('Inicio Sesion Completado')
    await page.goto('https://pedidosya.portal.restaurant/finance-py')
}

const seleccionarLocales = async (local) => {
        await waitForSelectorReintentos(page, 'button[class="MuiButton-root MuiButton-outlined MuiButton-outlinedPrimary MuiButton-sizeMedium MuiButton-outlinedSizeMedium MuiButtonBase-root css-923iae"]')
        await page.click('button[class="MuiButton-root MuiButton-outlined MuiButton-outlinedPrimary MuiButton-sizeMedium MuiButton-outlinedSizeMedium MuiButtonBase-root css-923iae"]')
        await waitForSelectorReintentos(page, 'span[class="MuiTypography-root MuiTypography-body1 MuiFormControlLabel-label css-9l3uo3"]')
        try {
            await page.waitForFunction((local) => { // LUEGO INTENTA 2do BLOQUE DE CODIGO
            const tds = Array.from(document.querySelectorAll('span'));
                for (const td of tds) {
                    if (td.textContent.includes(local)) {
                    td.click(); // Click en local para preseleccion antes de confirmar el cambio // Rompe el bucle después de hacer clic en el primer elemento que cumple con la condición
                    return true
                }
            }   
            }, {}, local);          
        } catch(error) {   console.error(error)        
        }
       await page.waitForTimeout(1000)
    }

const seleccionParametrosFecha = async () => {
    try {
        console.log('Seleccionando Parametros de Fecha')
        await page.waitForFunction(() => { // LUEGO INTENTA 2do BLOQUE DE CODIGO
        const ps = Array.from(document.querySelectorAll('p'));
            for (const p of ps) {
                if (p.textContent.includes('Fecha de pago')) {
                p.click(); // Click en local para preseleccion antes de confirmar el cambio // Rompe el bucle después de hacer clic en el primer elemento que cumple con la condición
                return true
                }
            }        
            return
        });  
        await page.waitForTimeout(4000)
      
       await waitForSelectorReintentos(page, 'path[d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"]')
       await page.waitForTimeout(2000)
       await page.click('path[d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"]')
       await page.waitForTimeout(2000)
       await page.waitForFunction(() => { // LUEGO INTENTA 2do BLOQUE DE CODIGO
            console.log('entramos al wait del input')
            let ps = Array.from(document.querySelectorAll('input'));
            console.log(ps)
            ps[11].focus()
            return true // esta funcion requiere return true para poderla detener, necesita recibir un valor valido
        });
        
        await page.keyboard.type(fechaInicio);
        await page.keyboard.press('ArrowLeft')
        await page.waitForTimeout(500)
        await page.keyboard.press('ArrowLeft')
        await page.waitForTimeout(500)
        await page.keyboard.press('ArrowLeft')
        await page.waitForTimeout(500)
        await page.keyboard.press('ArrowLeft')
        await page.waitForTimeout(500)
        await page.keyboard.press(anioIncicio1)
        await page.waitForTimeout(500)
        await page.keyboard.press('ArrowLeft')
        await page.waitForTimeout(500)
        await page.keyboard.press('ArrowLeft')
        await page.waitForTimeout(500)
        await page.keyboard.press('ArrowLeft')
        await page.waitForTimeout(500)
        await page.keyboard.press(anioIncicio2)
        await page.waitForTimeout(500)
        await page.keyboard.press(anioIncicio3)
        await page.waitForTimeout(500)
        await page.keyboard.press('ArrowLeft')
        await page.waitForTimeout(500)
        await page.keyboard.press(anioIncicio4)
        await page.waitForTimeout(500)
        await page.keyboard.press('Tab')
        await page.waitForTimeout(500)
        await page.keyboard.type(diaFinal);
        await page.waitForTimeout(500)
        await page.keyboard.type(mesFinal);
        await page.waitForTimeout(500)
        await page.keyboard.press(anioFinal4)
        await page.waitForTimeout(500)
        await page.keyboard.press('ArrowLeft')
        await page.waitForTimeout(500)
        await page.keyboard.press('ArrowLeft')
        await page.waitForTimeout(500)
        await page.keyboard.press('ArrowLeft')
        await page.waitForTimeout(500)
        await page.keyboard.press('ArrowLeft')
        await page.waitForTimeout(500)
        await page.keyboard.press(anioFinal1)
        await page.keyboard.press('ArrowLeft')
        await page.waitForTimeout(500)
        await page.keyboard.press('ArrowLeft')
        await page.waitForTimeout(500)
        await page.keyboard.press(anioFinal3)
        await page.waitForTimeout(500)
        await page.keyboard.press('ArrowLeft')
        await page.waitForTimeout(500)
        await page.keyboard.press(anioFinal4)
        await page.waitForTimeout(500)
        console.log('Seleccion de fechas completado')
        await page.keyboard.press('Tab')
        await page.keyboard.press('Space')
       /*  await page.waitForSelector('button[data-testid="date-range-submit"]')
        await page.click('button[data-testid="date-range-submit"]')
        await page.keyboard.press('Enter') */
        console.log('Cierre Menu de fechas')
        return
    } catch(error) {console.error(error)        
    }
}

const descargaArchivos = async () => {
    try {
    await page.waitForTimeout(2000)
    await waitForSelectorReintentos(page, 'path[d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"]')
    await page.click('path[d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"]')
    await page.waitForTimeout(1000)
    await page.waitForFunction(() => { // LUEGO INTENTA 2do BLOQUE DE CODIGO
        console.log('Descarga')
        const ps = Array.from(document.querySelectorAll('button'));
        console.log(ps)
        ps[10].click()
        return true // esta funcion requiere return true para poderla detener, necesita recibir un valor valido
    });
    console.log('Descarga Ejecutada')
    await page.waitForTimeout(10000)
}  catch(error) { throw new Error('Error al descargar archivo', error)}
  
}


// LOGICA PARA MOVER LOS ARCHIVOS DE LA CARPETA DOWNLOADS A LA CARPETA DESTINO

const waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const crearCarpetaOutput = async (carpetaDestinoPeYA) => {
  const rutaOutput = path.join(carpetaDestinoPeYA, 'output');

  try {
    await fs.access(rutaOutput);
  } catch (error) {
    // Si hay un error al intentar acceder, la carpeta no existe y la creamos
    await fs.mkdir(rutaOutput);
    console.log('Carpeta "output" creada correctamente.');
  }

  return rutaOutput; // Devolvemos la ruta de output para que esté disponible fuera de la función
};

export const moverArchivoYCambioNombre = async (local, tipoReporte, carpetaDestinoPeYA) => {
  // Crear la carpeta "output" si no existe
  const rutaOutput = await crearCarpetaOutput(carpetaDestinoPeYA);

  const nuevoNombre = local;
  const maxIntentos = 5;
  let intentos = 0;

  while (intentos < maxIntentos) {
    const archivosEnCarpetaOrigen = await fs.readdir(carpetaOrigen);

    if (archivosEnCarpetaOrigen.length > 0) {
      let archivoMasReciente;
      let fechaModificacionMasReciente = 0;

      for (const archivo of archivosEnCarpetaOrigen) {
        const rutaArchivo = path.join(carpetaOrigen, archivo);
        const stats = await fs.stat(rutaArchivo);

        if (stats.mtimeMs > fechaModificacionMasReciente) {
          fechaModificacionMasReciente = stats.mtimeMs;
          archivoMasReciente = archivo;
        }
      }

      if (archivoMasReciente) {
        const rutaOrigen = path.join(carpetaOrigen, archivoMasReciente);
        const extensionArchivoMasReciente = path.extname(archivoMasReciente);

        if (extensionArchivoMasReciente === '.zip') {
          const nombreOriginal = path.basename(archivoMasReciente);
          const nuevoNombreCompleto = nuevoNombre + '-' + tipoReporte + '-' + nombreOriginal;
          const rutaDestino = path.join(carpetaDestinoPeYA, nuevoNombreCompleto);

          try {
            // Mover el archivo zip a carpetaDestinoPeYA
            await fs.rename(rutaOrigen, rutaDestino);
            console.log(`Se movió "${archivoMasReciente}" a la carpeta de destino con el nuevo nombre "${nuevoNombreCompleto}".`);

            // Después de mover el archivo zip a carpetaDestinoPeYA
            const rutaZip = path.join(carpetaDestinoPeYA, nuevoNombreCompleto);

            try {
              // Extraer archivos del zip directamente en carpetaDestino
              await extractZip(rutaZip, { dir: carpetaDestinoPeYA });

              // Leer archivos en carpetaDestinoPeYA después de la extracción
              const archivosEnDestino = await fs.readdir(carpetaDestinoPeYA);
              const archivosAProcesar = archivosEnDestino.filter(archivo => {
                const extension = path.extname(archivo);
                return extension === '.xlsx' || extension === '.pdf';
              });

              // Clasificar archivos por grupos
              const gruposArchivos = {};
              let semanaCounter = 1;

              archivosAProcesar.forEach(archivo => {
                const numeroGrupo = Math.ceil(semanaCounter / 2);
                if (!gruposArchivos[numeroGrupo]) {
                  gruposArchivos[numeroGrupo] = [];
                }
                gruposArchivos[numeroGrupo].push(archivo);

                // Incrementar el contador de semana después de cada archivo
                semanaCounter++;
              });

              // Modificar el nombre de los archivos dentro de carpetaDestino
              for (const grupo in gruposArchivos) {
                const semanaCounter = Number(grupo);
                for (const archivoDestino of gruposArchivos[grupo]) {
                  const rutaArchivoDestino = path.join(carpetaDestinoPeYA, archivoDestino);
                  const nuevoNombreArchivoDestino = `SEMANA ${semanaCounter} - ${local}-${tipoReporte}-${archivoDestino}`;
                  const rutaDestinoArchivoDestino = path.join(rutaOutput, nuevoNombreArchivoDestino);

                  await fs.rename(rutaArchivoDestino, rutaDestinoArchivoDestino);
                  console.log(`Se cambió el nombre de "${archivoDestino}" a "${nuevoNombreArchivoDestino}".`);
                }
              }

              // Cambiar el nombre del directorio output
              const nuevoNombreOutput = 'output';
              const rutaNuevoOutput = path.join(carpetaDestinoPeYA, nuevoNombreOutput);

              await fs.rename(rutaOutput, rutaNuevoOutput);
              console.log(`Se cambió el nombre de "output" a "${nuevoNombreOutput}".`);

            } catch (error) {
              console.error(`Error al extraer o modificar archivos: ${error.message}`);
            }

            // Limpiar carpetaDestino para la siguiente iteración
            try {
              // Eliminar el archivo zip
              await fs.unlink(rutaZip);
              console.log(`Se eliminó el archivo zip "${nuevoNombreCompleto}".`);
            } catch (error) {
              console.error(`Error al eliminar el archivo zip: ${error.message}`);
            }

            break; // Rompe el bucle si la operación fue exitosa
          } catch (error) {
            console.error(`Error al cambiar el nombre del archivo: ${error.message}`);
          }
        } else {
          console.error(`El archivo más reciente "${archivoMasReciente}" no tiene la extensión ".zip". Esperando antes de volver a intentar...`);
        }
      } else {
        console.error('No se pudo determinar el archivo más reciente. Esperando antes de volver a intentar...');
      }
    } else {
      console.error('La carpeta de origen no tiene archivos.');
    }

    // Incrementa el número de intentos y espera antes de volver a intentar
    intentos++;
    await waitFor(10000); // Espera 10 segundos 
  }

  if (intentos === maxIntentos) {
    console.error(`Se alcanzó el número máximo de intentos (${maxIntentos}).`);
  }
};


const moverArchivosOutput = async () => {
  const rutaOutput = path.join(carpetaDestinoPeYA, 'output');

  try {
    // Obtener la lista de archivos en la carpeta "output"
    const archivosEnOutput = await fs.readdir(rutaOutput);
    // Mover cada archivo a la carpeta de destino con un nuevo nombre
    for (const archivoOutput of archivosEnOutput) {
      const rutaArchivoOutput = path.join(rutaOutput, archivoOutput);
      const rutaDestinoArchivoDestino = path.join(carpetaDestinoPeYA, archivoOutput);

      await fs.rename(rutaArchivoOutput, rutaDestinoArchivoDestino);
      console.log(`Se movió "${archivoOutput}" a la carpeta de destino con el mismo nombre.`);
    }
    // Eliminar la carpeta "output" después de mover los archivos
    await fs.rmdir(rutaOutput, { recursive: true });
    console.log('Se eliminó la carpeta "output".');
  } catch (error) {
    console.error(`Error al mover archivos o eliminar la carpeta "output": ${error.message}`);
  }
};


const consolidarArchivosPeYA = async () => {
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
    console.log(`Tiempo transcurrido al Consolidar Archivos: ${tiempoTranscurrido.toFixed(2)} segundos.`);
  } catch (error) {
    console.error('Error al escribir en el archivo:', error.message);
    console.error(error);
  }
  }
 


/*   await page.type('input[id="login-email-field"]', userPeYA) */

(async () => {
await iniciarSesion()
for (const local of localesPeYA) {
  console.log(`Sociedad ${local} seleccionada`)

      while(true) {
        try {
            await seleccionarLocales(local)
            fechaInicio = fechaInicioPeYA //reset parametros de fecha
            fechaFinal =  fechaFinalPeYA  //reset parametros de fecha
            if(local === "Gastronomica San Joaquin SA" || local === "THELONIOUS MONK S.A." || local === "OMAKASE SA" || local ===  "PICHIN LIGHT" ) {
              console.log(fechaInicio) 
              console.log(fechaFinal) 
              fechaInicio = moment(fechaInicio, 'DDMMYYYY');
              fechaFinal = moment(fechaFinal, 'DDMMYYYY');
              fechaInicio = fechaInicio.subtract(1, 'weeks');
              fechaFinal = fechaFinal.subtract(1, 'weeks');
              console.log(fechaInicio) 
              console.log(fechaFinal) 
              fechaInicio = fechaInicio.format('DDMMYYYY');
              fechaFinal = fechaFinal.format('DDMMYYYY');
              console.log(fechaInicio) 
              console.log(fechaFinal) 
              diaInicio = fechaInicio.slice(0, 2);    
              mesInicio = fechaInicio.slice(2, 4);    
              anioInicio = fechaInicio.slice(4,8);     
              anioIncicio1 = fechaInicio.slice(4,5);     
              anioIncicio2 = fechaInicio.slice(5,6); 
              anioIncicio3 = fechaInicio.slice(6,7);
              anioIncicio4 = fechaInicio.slice(7,8);           
              diaFinal = fechaFinal.slice(0, 2);    
              mesFinal = fechaFinal.slice(2, 4);    
              anioFinal = fechaFinal.slice(4,8);
              anioFinal1 = fechaFinal.slice(4,5);     
              anioFinal2 = fechaFinal.slice(5,6); 
              anioFinal3 = fechaFinal.slice(6,7);
              anioFinal4 = fechaFinal.slice(7,8); 
            }else {
              fechaInicio = fechaInicioPeYA
              fechaFinal =  fechaFinalPeYA  
              diaInicio = fechaInicio.slice(0, 2);    
              mesInicio = fechaInicio.slice(2, 4);    
              anioInicio = fechaInicio.slice(4,8);     
              anioIncicio1 = fechaInicio.slice(4,5);     
              anioIncicio2 = fechaInicio.slice(5,6); 
              anioIncicio3 = fechaInicio.slice(6,7);
              anioIncicio4 = fechaInicio.slice(7,8);           
              diaFinal = fechaFinal.slice(0, 2);    
              mesFinal = fechaFinal.slice(2, 4);    
              anioFinal = fechaFinal.slice(4,8);
              anioFinal1 = fechaFinal.slice(4,5);     
              anioFinal2 = fechaFinal.slice(5,6); 
              anioFinal3 = fechaFinal.slice(6,7);
              anioFinal4 = fechaFinal.slice(7,8); 
            }

            await seleccionParametrosFecha()
            await descargaArchivos()
            await moverArchivoYCambioNombre(local, 'PeYA', carpetaDestinoPeYA)
          
            await page.goto('https://pedidosya.portal.restaurant/finance-py')
            break
        }catch(error) {
            console.error(`Renicio de proceso para ${local} de local por error: `, error)
            await page.goto('https://pedidosya.portal.restaurant/finance-py')
            continue
        }
    }
    fechaInicio = fechaInicioPeYA
    fechaFinal = fechaFinalPeYA


  
}
 // Eliminar la carpeta "output"
await moverArchivosOutput()
await consolidarArchivosPeYA()

const endTime = performance.now();
      const elapsedTime = (endTime - startTime)/60000;
      console.log(`Proceso finalizado. Tiempo total del proceso = ${elapsedTime} minutos`)
}) ()

