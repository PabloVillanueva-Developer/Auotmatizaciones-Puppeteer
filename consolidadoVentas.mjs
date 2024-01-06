// IMPORT MODULOS
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path'; // Agrega esta línea
import readline from 'readline';

//IMPORT DATOS USUARIOS Y LOCALES
import {userToteat} from './datosUsuario.mjs'
import {passwordToteat} from './datosUsuario.mjs'
import {carpetaOrigen} from './datosUsuario.mjs'
import {carpetaDestinoConsolidadoVentas} from './datosUsuario.mjs'
import {localesTodos} from './datosUsuario.mjs'
import {localesTodosPropios} from './datosUsuario.mjs'
import {localesTeaConnection} from './datosUsuario.mjs'
import {localesGreenEat} from './datosUsuario.mjs'
import {localesCasaSaenz} from './datosUsuario.mjs'
import {localesAliadosExternos} from './datosUsuario.mjs'
import {grupoLocalesSeleccionado} from './datosUsuario.mjs'
import {fechaInicio} from './datosUsuario.mjs'
import {fechaFinal} from './datosUsuario.mjs'



// Crear una interfaz de línea de comandos para entrada/salida
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

  // crea una funcion asincronica | Inicio Conteo de Tiempo | Inicio Sesion Puppeteer 
const startTime = performance.now(); // conteo de tiempo del proceso
const browser = await puppeteer.launch({ 
    headless: 'new', // creamos una isntancia de pupeteer y configuramos el objeto anonimo en headless false p/Chromium visible
    });
const page = await browser.newPage() //creamos nueva pagina en el navegador
  
let iniciarSesion = async () => {
      await page.goto('https://res3.toteat.com/#/logintoteat')
      await page.type('input[type="email"]', userToteat)
      await page.type('input[type="password"]', passwordToteat)
      await page.click('button[type="submit"]')
      await page.waitForTimeout(5000);
      console.log('Inicio Sesion correcto')
}

const seleccionGrupoLocales = (grupoLocalesSeleccionado) => {
  switch (grupoLocalesSeleccionado) {
    case 'localesTodos': return localesTodos;
    case 'localesTeaConnection': return localesTeaConnection;
    case 'localesGreenEat': return localesGreenEat;
    case 'localesCasaSaenz': return localesCasaSaenz;
    case 'localesAliadosExternos': return localesAliadosExternos;
    case 'localesTodosPropios': return localesTodosPropios;
    case 'localesSeleccionPersonalizada': return localesSeleccionPersonalizada;
    default:
      console.log('Nombre de grupo no válido. Elige entre localesTodos, localesTeaConnection, localesGreenEat,localesCasaSaenz o localesAliadosExternos.');
      rl.close();
  }
};

let seleccionarLocal = async (local) => { // SELECCION DE LOCALE
      await page.goto('https://res3.toteat.com/#/restaurant') 
      await page.waitForFunction((local) => {
            const tds = Array.from(document.querySelectorAll('td'));
            for (const td of tds) {
              console.log(td)
              if (td.textContent.includes(local)) {
                td.click(); // Click en local para preseleccion antes de confirmar el cambio
                return true  // Rompe el bucle después de hacer clic en el primer elemento que cumple con la condición
              }
            }
            return false    
      }, {}, local); // Especificacion que hace que la variable local de node, este disponible en el contexto del navegador (en el caso de page.evaluete)
      await page.waitForTimeout(1000);

      // Click en boton 'Confirmar' para local preseleccionado
      await page.evaluate(() => {
            const spans = Array.from(document.querySelectorAll('span'));
            for (const span of spans) {
              if (span.textContent.includes('Confirmar')) {
                  span.click();
                  break; // Rompe el bucle después de hacer clic en el primer elemento que cumple con la condición
              }
            }
      });
      console.log('Seleccion Local Confirmado ' + local)
}

let selectRangoFechasConsolidadoVentas = async (fechaInicio, fechaFinal) => {
  let selectorPromise 
  let timeoutPromise 
  let result 
  
  await page.waitForTimeout(1000);
  await page.goto('https://res3.toteat.com/#/reportes/consolidadoventas')
  await page.waitForTimeout(1000);

  let ingresarParametrosDeReporte = async (fechaInicio, fechaFinal) => {
      await page.waitForSelector('select')
      await page.click('select')
      await page.waitForTimeout(1000);
      await page.keyboard.type('p');
      await page.waitForTimeout(1000);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      await page.waitForSelector('input[ng-model="varios.fechaDesde"]')
      await page.type('input[ng-model="varios.fechaDesde"]', `${fechaInicio}` ); 
      await page.waitForTimeout(1000);
      await page.keyboard.press('Tab');
      await page.waitForTimeout(1000);
      await page.keyboard.type(`${fechaFinal}`); 
      await page.waitForTimeout(1000);
      await page.waitForSelector('button[ng-click="generaReporte()"]', { timeout: 60000 })
      await page.click('button[ng-click="generaReporte()"]')
      selectorPromise = page.waitForSelector('a[id="linkDl-1-1"]', { timeout: 60000 });
      timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 60000));
      result = await Promise.race([selectorPromise, timeoutPromise]);
  }
  await ingresarParametrosDeReporte(fechaInicio, fechaFinal, result, timeoutPromise, selectorPromise)
  while (result === null) {
      console.log('El selector no se encontró en el tiempo especificado. Recargando la página.');
      await page.reload(); // Recarga pagina si tarda mas de 60s y repite proceso
      await page.waitForTimeout(1000);
      ingresarParametrosDeReporte(fechaInicio, fechaFinal, result, timeoutPromise, selectorPromise) 
  }

      await page.click('button[ng-click="generaReporte()"]')
      console.log('Seleccion Fechas Correcto')
      await page.waitForTimeout(1000);
      await page.waitForSelector('a[id="linkDl-1-1"]')
      await page.click('a[id="linkDl-1-1"]');
      console.log('Proceso de Descarga Iniciado')
      await page.waitForTimeout(20000);
}

let moverArchivoYCambioNombre = async () => {
      
      const nuevoNombre = await page.evaluate(() => { 
          const elemento = document.querySelector('#restoTexto'); 
          return elemento.textContent
      })

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
              const nombreOriginal = path.basename(archivoMasReciente); // Obtiene el nombre original del archivo
              const nuevoNombreCompleto = nuevoNombre + '-' + nombreOriginal; // Combina los nombres
              const rutaDestino = path.join(carpetaDestinoConsolidadoVentas, nuevoNombreCompleto);
            try {
                await fs.rename(rutaOrigen, rutaDestino);
                console.log(`Se movió "${archivoMasReciente}" a la carpeta de destino con el nuevo nombre "${nuevoNombreCompleto}".`);
                } catch (error) {
                console.error(`Error al cambiar el nombre del archivo: ${error.message}`);
              }
          }   else {
                console.error('No se pudo determinar el archivo más reciente.');
              }

      } else {
          console.error('La carpeta de origen no tiene archivos.');
        }
  };

  
// EJECUCION GENERAL DE LA APP

(async () => {
    console.log('Proceso Descarga Reportes Consolidado Ventas Inicializado')
    console.log("Fecha de inicio seleccionada: " + fechaInicio)
    console.log("Fecha de fin seleccionada " + fechaFinal)
    await iniciarSesion()
    const grupoLocales = seleccionGrupoLocales(grupoLocalesSeleccionado)
    for (const local of grupoLocales) {
        await seleccionarLocal(local)
        await selectRangoFechasConsolidadoVentas(fechaInicio, fechaFinal)
        await moverArchivoYCambioNombre()
    }
    console.log('Proceso finalizado.')
    const endTime = performance.now();
    const elapsedTime = (endTime - startTime)/60000;
    console.log(`Proceso finalizado. Tiempo total del proceso = ${elapsedTime} minutos`)
}) ();






