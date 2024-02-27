import fs from 'fs/promises';
import path from 'path'; // Agrega esta línea
import xlsx from 'xlsx';
import { userClover } from "./datosUsuario.mjs"
import { passwordClover } from "./datosUsuario.mjs" 
import puppeteer from "puppeteer"
import { fechaInicioClover } from './datosUsuario.mjs';
import { fechaFinalClover } from './datosUsuario.mjs';
const fechaHoraInicio = fechaInicioClover + "0400"
const fechaHoraFinal =  fechaFinalClover + "0159"
/* import {moverArchivoYCambioNombre} from './funcionesReutilizables.mjs' */

import {localesClover} from "./datosUsuario.mjs" 
import { carpetaOrigen } from './datosUsuario.mjs';
import { carpetaDestinoClover } from './datosUsuario.mjs';

const diaInicio = fechaHoraInicio.slice(0, 2);    
const mesInicio = fechaHoraInicio.slice(2, 4);    
const anioInicio = fechaHoraInicio.slice(4,8);     
const diaFinal = fechaHoraFinal.slice(0, 2);    
const mesFinal = fechaHoraFinal.slice(2, 4);    
const anioFinal = fechaHoraFinal.slice(4,8);      

const startTime = performance.now(); // conteo de tiempo del proceso
const browser = await puppeteer.launch({ 
    headless: 'new',
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


let iniciarSesion = async () => {
    console.log(`Proceso descarga reportes Clover Incializado.`)
    console.log("Fecha de inicio seleccionada: " + diaInicio + '-' + mesInicio + '-' + anioInicio)
    console.log("Fecha de finalizacion seleccionada "+ diaFinal + '-' + mesFinal + '-' + anioFinal)
    await page.goto('https://www.la.clover.com/dashboard/login')
    await waitForSelectorReintentos(page, 'input[type="text"]')
    await page.type('input[type="text"]', userClover)
    await page.type('input[type="password"]', passwordClover)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(5000);
    console.log('Inicio Sesion Completado')
    await page.goto('https://www.la.clover.com/transactions/m/VQE463T65SF11/payments')
}



let seleccionarLocales = async (local) => {
    let flagSeleccionarLocales = true
    while (flagSeleccionarLocales) {
      try {
          try { // INTEANTA 1er BLOQUE DE CODIGO
          await waitForSelectorReintentos (page, 'button[class="AMY+CHGR--styles_handler__Bd7SG AMY+CHGR--styles_left__YP+q3 menuitemInMenubar"]')
          await page.click('button[class="AMY+CHGR--styles_handler__Bd7SG AMY+CHGR--styles_left__YP+q3 menuitemInMenubar"]')
          await page.waitForSelector('iframe[title="Main Content"]')
          }catch(error) {
            throw new Error(console.error('Menu de Seleccion de Locales no encontrado'))
          }        
          // Seleccion con array de todos los buttons y seleccion del que cuyo texto coincida con el parametro enviado.
  
          try {await page.waitForFunction((local) => { // LUEGO INTENTA 2do BLOQUE DE CODIGO
            const tds = Array.from(document.querySelectorAll('button'));
            for (const td of tds) {
                if (td.textContent.includes(local)) {
                  td.click(); // Click en local para preseleccion antes de confirmar el cambio
                  return true  // Rompe el bucle después de hacer clic en el primer elemento que cumple con la condición
                }
            }
          return false    
          }, {}, local);
          console.log(`${local} seleccionado`)
          
            } catch(error) {
              throw new Error(console.error(`Error al seleccionar ${local}`, error))
            }
          break // Si el los dos bloques try se cumplen, sentencia de break para romper el bucle

      }catch(error) {
      console.error('Reiniciando proceso seleccion locales')
      await page.goto('https://www.la.clover.com/transactions/m/VQE463T65SF11/payments')
      continue
      }
    }
 }

const seleccionarParametrosFecha = async (local) => {
    try {
        const frame = await page.waitForSelector('iframe[title="Main Content"]'); 
        const frameContent = await frame.contentFrame();
        if (frameContent) {
            // Ahora puedes interactuar con el contenido del iframe
            await waitForSelectorReintentos(frameContent, 'input[id="startDate-1"]')
            await frameContent.click('input[id="startDate-1"]');
        } else { 
            console.error('No se pudo encontrar el contenido del iframe');
        }
        await page.keyboard.down('Shift');
        await page.keyboard.press('Tab');
        await page.keyboard.up('Shift');

        await page.keyboard.down('Shift');
        await page.keyboard.press('Tab');
        await page.keyboard.up('Shift');

        await page.type('input[type="text"]', fechaHoraInicio)
        await page.keyboard.press('Tab');  
        await page.type('input[type="text"]', fechaHoraFinal)
        console.log(`Parametros de fecha seleccionados`)
        await page.waitForTimeout(10000)
        await waitForSelectorReintentos (frameContent, 'a[class="c-link-petite"]')
        await frameContent.click('a[class="c-link-petite"]')
        console.log(`Descarga ${local} Ejecutada`)
        await page.waitForTimeout(20000)
    }catch(error) {
      throw new Error (console.error('Error en parametros de fecha o selecciona de local. Funcion seleccionarParametrosFecha()', error))
    }
}

const waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms)); // Funcion que crea un intervalo de tiempo, encapsulando logica de Timeout en una promesa. Mas conveniente para manejar con asincronia

let moverArchivoYCambioNombre = async (local, tipoReporte, carpetaDestino) => {
  try {
    const nuevoNombre = local
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
            if (extensionArchivoMasReciente === '.csv') {
            const nombreOriginal = path.basename(archivoMasReciente);
            const nuevoNombreCompleto = nuevoNombre + '-' + tipoReporte + '-' + nombreOriginal;
            const rutaDestino = path.join(carpetaDestino, nuevoNombreCompleto);
  
            try {
              await fs.rename(rutaOrigen, rutaDestino);
              console.log(`Se movió "${archivoMasReciente}" a la carpeta de destino con el nuevo nombre "${nuevoNombreCompleto}".`);
              break; // Rompe el bucle si la operación fue exitosa
            } catch (error) {
              console.error(`Error al cambiar el nombre del archivo: ${error.message}`);
            }
          } else {
            console.error(`El archivo más reciente "${archivoMasReciente}" no tiene la extensión ".csv". Esperando antes de volver a intentar...`);
            throw new Error('')
          }
        } else {
          console.error('No se pudo determinar el archivo más reciente. Esperando antes de volver a intentar...');
          throw new Error('')
        }
      } else {
        console.error('La carpeta de origen no tiene archivos.');
        throw new Error('')
      }
  
      // Incrementa el número de intentos y espera antes de volver a intentar
      intentos++;
      await waitFor(10000); // Espera 10 segundos 
    }
  
    if (intentos === maxIntentos) {
      console.error(`Se alcanzó el número máximo de intentos (${maxIntentos}).`);
    }
  }catch(error) {
    throw new Error('Error en manejo de archivos por fs', error)
  }
  };

const rutaLibroDestino = carpetaDestinoClover

const consolidarArchivos = async () => {
console.log('Consolidacion en proceso. Por favor espere...')
// Crear un nuevo libro (workbook) con una hoja en blanco DETALLE
const nuevoLibro = xlsx.utils.book_new();

// Obtener la lista de archivos en la carpeta de destino
const archivos = await fs.readdir(carpetaDestinoClover);
// Filtrar el archivo de destino para que no se incluya en la lista a iterar
const archivosFiltrados = archivos.filter((archivo) => archivo !== 'ARCHIVO CONSOLIDADO.xlsx');

// Iniciar contador de tiempo
const tiempoInicio = process.hrtime();

// Iterar sobre cada archivo en la carpeta
for (const elemento of archivosFiltrados) {
  // Construir la ruta completa del archivo
  const rutaArchivo = path.join(carpetaDestinoClover, elemento);

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
        fila.unshift(nombreCompletoArchivo);
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
  console.log(`Tiempo transcurrido en Consolidar Archivo Final: ${tiempoTranscurrido.toFixed(2)} segundos.`);
} catch (error) {
  console.error('Error al escribir en el archivo:', error.message);
  console.error(error);
}
}


( async () => {
await iniciarSesion()

for (const local of localesClover) {

  while(true)
    try {
    await seleccionarLocales(local)
    while(true) {
        await seleccionarParametrosFecha(local)
        break
    }
    await moverArchivoYCambioNombre(local, 'Clover', carpetaDestinoClover)
    await page.goto('https://www.la.clover.com/transactions/m/VQE463T65SF11/payments')
    break
    }catch(error) {
      console.error(`Reiniciando proceso para ${local}`)
      continue
    }
    
}
await consolidarArchivos()
const endTime = performance.now();
      const elapsedTime = (endTime - startTime)/60000;
      console.log(`Proceso finalizado. Tiempo total del proceso = ${elapsedTime} minutos`)
      await page.goto('https://www.la.clover.com/transactions/m/VQE463T65SF11/payments')
      await browser.close()
}) ()


