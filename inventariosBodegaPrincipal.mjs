import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path'; // Agrega esta línea
import readline from 'readline';

import {userToteat} from './datosUsuario.mjs'
import {passwordToteat} from './datosUsuario.mjs'
import {carpetaOrigen} from './datosUsuario.mjs'
import {carpetaDestinoBodegaPrincipal} from './datosUsuario.mjs'
import {localesSeleccionPersonalizada} from './datosUsuario.mjs'
import {localesTodos} from './datosUsuario.mjs'
import {localesTodosPropios} from './datosUsuario.mjs'
import {localesTeaConnection} from './datosUsuario.mjs'
import {localesGreenEat} from './datosUsuario.mjs'
import {localesCasaSaenz} from './datosUsuario.mjs'
import {localesAliadosExternos} from './datosUsuario.mjs'
import {grupoLocalesSeleccionado} from './datosUsuario.mjs'
import {fechaInicio} from './datosUsuario.mjs'
import {fechaFinal} from './datosUsuario.mjs'

const diaInicio = fechaInicio.slice(0, 2);    
const mesInicio = fechaInicio.slice(2, 4);    
const anioInicio = fechaInicio.slice(4);     
const diaFinal = fechaFinal.slice(0, 2);    
const mesFinal = fechaFinal.slice(2, 4);    
const anioFinal = fechaFinal.slice(4);      



  // Crear una interfaz de línea de comandos para entrada/salida
  const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
  });
  
   // crea una funcion asincronica | Inicio Conteo de Tiempo | Inicio Sesion Puppeteer  
    const startTime = performance.now(); // conteo de tiempo del proceso
    const browser = await puppeteer.launch({ 
        headless:  'new', // creamos una isntancia de pupeteer y configuramos el objeto anonimo en headless false p/Chromium visible
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
        console.log('Nombre de grupo no válido. Elige entre localesTodos, localesTodosPropios, localesTeaConnection, localesGreenEat,localesCasaSaenz o localesAliadosExternos.');
        rl.close();
    }
  };
  
  let seleccionarLocal = async (local) => { // SELECCION DE LOCALES
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
        await page.waitForTimeout(2000);
  }

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


  const irReporteInventarios = async() => {
    await page.waitForTimeout(1000)
    const elemento = await page.$('div[id="billingAlertModal"]');// busqueda de selector 1
    const elemento2 = await page.$('div[id="billingAlertContainer"]'); // alternativa busqueda selector 2
    
    await page.goto('https://res3.toteat.com/#/inventorymenu')
    await page.waitForTimeout(5000)
    console.log('Ingreso a URL reportes Inventarios')
    await page.waitForTimeout(1000)    
        if(elemento || elemento2) { // Si hay un alert al ingresar a Inv. Final, este se cierra para continuar con el proceso. Asignadas dos opciones de busqueda
          console.log('Ventana Emergente Alert: Detectada')
          await page.click('div[class="closeCircle"]')
          console.log('Ventana Emergente Alert: Cerrada')
          await page.waitForTimeout(5000)
        }
    await waitForSelectorReintentos(page, 'a[ng-click="cambioTab(6)"]' )
    await page.click('a[ng-click="cambioTab(6)"]')  // agregar una accion de reset cuando no lo encuentra para que recargue o algo asi (alguna vez falla aca si demora la rpta)    
    await page.click('a[ng-click="cambioTab(6)"]')
    console.log('Inventario Final Seleccionado')
    await page.waitForTimeout(1000)
        
  }

  
  const ingresarParametrosReporteInventario = async () => { // ............Todavia aluna ve falla
    // Seleccion parametro check "Dif."
    await page.waitForTimeout(2000)
    await waitForSelectorReintentos(page, 'th[ng-click="sortConsolidadosRows(1)"]' )
    await waitForSelectorReintentos(page, 'input[ng-model="varios.muestraDif"]' )
    /* await page.waitForTimeout(5000)
    await waitForSelectorReintentos(page, 'input[ng-model="varios.muestraDif"]' )
    await page.click('input[ng-model="varios.muestraDif"]')
    console.log('Seleccion Check "Dif."') */
    
    try {
    await waitForSelectorReintentos(page, 'select[ng-model="prefs.vistaIFV"]' )
    await page.click('select[ng-model="prefs.vistaIFV"]')
    await page.waitForTimeout(2000)
    await waitForSelectorReintentos(page, 'option[label="Inv. Final Valorizado - Costo Ultima Compra"]' )
    await page.waitForTimeout(2000) 
    await page.keyboard.press('n');
    await page.keyboard.press('n');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000)
    console.log('Inv. Final Valorizado - Costo Ultima Compra - Seleccionado')
    } catch(error) {console.error('fallo en la seleccion de Inv. Final Valorizado - Costo Ultima Compra', error)}

    
}

  let ingresarParametrosFecha = async (fechaInicio, fechaFinal) => {
    await waitForSelectorReintentos(page, 'select[ng-change="cambioFechas(1)"]' )
    await page.waitForTimeout(2000)
    await page.click('select[ng-change="cambioFechas(1)"]')

    await page.waitForTimeout(1000);
    await page.keyboard.type('p');
    await page.waitForTimeout(1000);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    await waitForSelectorReintentos(page, 'input[ng-model="varios.dateFrom"]' )
    await page.type('input[ng-model="varios.dateFrom"]', `${fechaInicio}` ); 
    await page.waitForTimeout(1000);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(1000);
    await page.keyboard.type(`${fechaFinal}`);
    console.log('Parametros de fecha ingresados') 
  }



const reporteBodegaPrincipal = async(letraInicioSelect, vecesArrowDown, local) => {
   
    try {
        await page.waitForTimeout(3000)
        await waitForSelectorReintentos(page, 'th[ng-click="sortConsolidadosRows(1)"]' )
        await waitForSelectorReintentos(page, 'select[ng-change="cambioBodegaInvFinal()"]' )  
        await page.click('select[ng-change="cambioBodegaInvFinal()"]')
        await page.keyboard.press(`${letraInicioSelect}`);
        for (let i = 0; i < vecesArrowDown; i++) {
            await page.keyboard.press('ArrowDown');
        }
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000)
        await page.click('button[ng-click="generaConsolidados()"]')
        console.log(local + ' Generando Reporte - Bodega Principal') // click actualizar datos. ¿puede reconocer cuando termina de cargar datos?
        await waitForSelectorReintentos(page, 'th[ng-click="sortConsolidadosRows(1)"]' )  
        await waitForSelectorReintentos(page, 'a[id="linkDl-5-1"]' )  
        await page.click('a[id="linkDl-5-1"]')
        console.log(local + ' Descarga ejecutada - Bodega Principal')
        await page.waitForTimeout(20000);
    } catch (error) {
   /*      console.error('Aviso de error en bloque try. Reintento de descarga', error)  */
        throw error;
    }
    
     // Clck descargar

    let tipoReporte = "BodegaPrincipal"
    moverArchivoYCambioNombre(tipoReporte, carpetaDestinoBodegaPrincipal)

}




// LOGICA PARA MOVER LOS ARCHIVOS DE LA CARPETA DOWNLOADS A LA CARPETA DESTINO

const waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let moverArchivoYCambioNombre = async (tipoReporte, carpetaDestino) => {
  const nuevoNombre = await page.evaluate(() => { 
    const elemento = document.querySelector('#restoTexto'); 
    return elemento.textContent;
  });

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

        if (extensionArchivoMasReciente === '.xls') {
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
          console.error(`El archivo más reciente "${archivoMasReciente}" no tiene la extensión ".xls". Esperando antes de volver a intentar...`);
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



// EJECUCION DEL PROGRAMA

  (async () => {
    console.log('Proceso Descarga Reportes Inventario Bodega Principal Inicializado')
    console.log("Fecha de inicio seleccionada: " + diaInicio + '-' + mesInicio + '-' + anioInicio)
    console.log("Fecha de finalizacion seleccionada "+ diaFinal + '-' + mesFinal + '-' + anioFinal)
    await iniciarSesion()
    const grupoLocales = seleccionGrupoLocales(grupoLocalesSeleccionado) // switch de seleccion de array con grupo de locales.
    const intentosMaximos = 3
    const funcionesEjecutadas = { // condiciones para evitar repetir descargas de reportes ya ejecutados.
      'reporteBodegaPrincipal': false,
    };

    for (const local of grupoLocales) {
      let iteracionCompletaExitosa = false
          await seleccionarLocal(local)
          while(!iteracionCompletaExitosa)
            try {
              await irReporteInventarios()
              await ingresarParametrosReporteInventario() // parametros para Tea Connection y Casa Saenz
              await ingresarParametrosFecha(fechaInicio, fechaFinal)
              if(local.includes('TEAAR')) {
                      await reporteBodegaPrincipal('t', 2, local) // luego condicionar los reportes segun los locales
                    
  
              }if(local.includes('CSZAR')) {
                   // VERIFICA SI LA FUNCION ESTA EJECUTADA PARA NO REPETIRLA EN EL BUCLE DE REINICIO.
                      await reporteBodegaPrincipal('t', 2, local) // luego condicionar los reportes segun los locales
                    
                
              }if(local.includes('GEAAR')) {
                     // VERIFICA SI LA FUNCION ESTA EJECUTADA PARA NO REPETIRLA EN EL BUCLE DE REINICIO.
                      await reporteBodegaPrincipal('t', 2, local) // luego condicionar los reportes segun los locales  
              }
              iteracionCompletaExitosa = true
              funcionesEjecutadas['ReporteDesperdicio'] = false;
            
            
            }catch (error) {

              continue; // que reinicie el bucle si llega el error de selector no encontrado.
            }
          
      }
      const endTime = performance.now();
      const elapsedTime = (endTime - startTime)/60000;
      console.log(`Proceso finalizado. Tiempo total del proceso = ${elapsedTime} minutos`)
  }) ();



// Ver si puedo crear una hoja solo con datos de usuario y locales para export e import. Al ser solo datos de uso, no va a tener ejecucion esa pagina
// Agregar Descargas Tarjetas Clover
// Agregar Descargas PeYA
// Agregar Descargas Rappi

// COMENTAR Y ORDENAR EL CODIGO.


// RECOMENDACIONES DE USO: 

// 1) No conviene estar descargando archivos mientras sucede el proceso por si agarra el archivo equivocado (siempre toma el ultimo descargado).
// 2) Alguna vez el nombre se baja asi: "FLOGEAAR-Donacion-Sin confirmar 217042.crdownload". Se cambia la extension .crdonwload por .xls y se puede leer.
// 3) Avisos de bloqueo por falta de pago pueden frenar el proceso.