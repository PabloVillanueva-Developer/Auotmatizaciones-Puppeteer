import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path'; // Agrega esta línea
import { userViral } from './datosUsuario.mjs';
import { passwordViral } from './datosUsuario.mjs';
import { carpetaDestinoViralTeaConnection } from './datosUsuario.mjs';
import { carpetaDestinoViralGreenEat } from './datosUsuario.mjs';
import { carpetaOrigen } from './datosUsuario.mjs';
let carpetaDestino

import { marca } from './datosUsuario.mjs';
import { area } from './datosUsuario.mjs';
import { descripcion } from './datosUsuario.mjs';
import { monto } from './datosUsuario.mjs';
import { cant } from './datosUsuario.mjs';


// EJEMPLO DE USO: node viral.mjs 'Tea Connection' ADM 'Sebastian 22/12' 15000 9
//                                     Marca       Area    Descripcion   Monto Cantidad



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
    console.log(`Proceso descarga Vouchers Viral Incializado.`)
    console.log(`Marca = ${marca}`)
    console.log(`Area = ${area}`)
    console.log(`Descripcion = ${descripcion}`)
    console.log(`Importe = ${monto}`)
    console.log(`Cantidad Solicitada = ${cant}`)
    await page.goto('https://muyviral.com.ar/login.php')
    await waitForSelectorReintentos(page, 'input[id="username"]')
    await page.type('input[id="username"]', userViral)
    await page.type('input[id="password"]', passwordViral)
    await page.click('button[type="submit"]')
}

const descargarVoucher = async () => {
    await page.goto('https://muyviral.com.ar/new.php')
    await page.waitForTimeout(300)
    await waitForSelectorReintentos(page, 'select[name="marca"]')
    await page.select('select[name="marca"]', marca);
    await page.waitForTimeout(300)
    console.log('Marca Seleccionada')
    await page.select('select[name="area"]', area);
    await page.waitForTimeout(300)
    console.log('Area Seleccionada')
    await page.type('input[id="nombre"]', descripcion);
    await page.waitForTimeout(300)
    console.log('Descripcion completada')
    await page.type('input[id="saldo"]', monto);
    await page.waitForTimeout(300)
    console.log('Monto Cargado')
    await page.click('button[type="submit"]');
    await page.waitForTimeout(300)
    console.log('Generando Voucher')
    await page.waitForTimeout(3000)
    await waitForSelectorReintentos(page, 'a[id="btn-Convert-Html2Image"]')
    await page.click('a[id="btn-Convert-Html2Image"]');
    await page.waitForTimeout(300)
    console.log('Voucher Descargado') 
 
}



// LOGICA PARA MOVER LOS ARCHIVOS DE LA CARPETA DOWNLOADS A LA CARPETA DESTINO

export let moverArchivoYCambioNombre = async (carpetaDestino) => {
  const nuevoNombre = 'Voucher'
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

        if (extensionArchivoMasReciente === '.png') {
          const nombreOriginal = path.basename(archivoMasReciente);
          const nuevoNombreCompleto = nuevoNombre + '-' + nombreOriginal;
          const rutaDestino = path.join(carpetaDestino, nuevoNombreCompleto);

          try {
            await fs.rename(rutaOrigen, rutaDestino);
            console.log(`Se movió "${archivoMasReciente}" a la carpeta de destino con el nuevo nombre "${nuevoNombreCompleto}".`);
            break; // Rompe el bucle si la operación fue exitosa
          } catch (error) {
            console.error(`Error al cambiar el nombre del archivo: ${error.message}`);
          }
        } else {
          console.error(`El archivo más reciente "${archivoMasReciente}" no tiene la extensión ".png". Esperando antes de volver a intentar...`);
        }
      } else {
        console.error('No se pudo determinar el archivo más reciente. Esperando antes de volver a intentar...');
      }
    } else {
      console.error('La carpeta de origen no tiene archivos.');
    }

    // Incrementa el número de intentos y espera antes de volver a intentar
    intentos++;
    await page.waitForTimeout(5000); // Espera 10 segundos 
  }

  if (intentos === maxIntentos) {
    console.error(`Se alcanzó el número máximo de intentos (${maxIntentos}).`);
  }
};


(async() => {
await iniciarSesion()

    for (let i = 0; i < cant; i++) {
        const contadorVouchers = i + 1
        while(true) {
            try {
                await descargarVoucher()
                if(marca === 'Tea Connection') {
                    carpetaDestino = carpetaDestinoViralTeaConnection
                    await moverArchivoYCambioNombre(carpetaDestino)
                }else{
                    carpetaDestino = carpetaDestinoViralGreenEat
                    await moverArchivoYCambioNombre(carpetaDestino)
                }
                await page.goto('https://muyviral.com.ar/new.php')
                console.log(`Voucher ${contadorVouchers} de ${cant} generado.`)
                break
             }catch(error) {
                console.error('Error en proceso de Voucher. Reiniciando proceso...', error)}
                continue
        }          
    }
    const endTime = performance.now()
    const elapsedlTime = (endTime - startTime)/60000
    console.log(`El tiempo total del proceso fue de ${elapsedlTime}`)
    console.log('Proceso Finalizado')
})()
