
import { fileURLToPath } from 'url'; // permite obtener informacion de rutas
import { dirname, join } from 'path';  // permite manejar rutas de forma mas eficiente y segura
import os from 'os'; // permite acceder a informacion de rutas del sistema operativo local

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const directorioBaseUsuario = os.homedir();


// TOTEAT
const userToteat = "pvillanueva@grupojaka.com"
const passwordToteat = "pvillanueva1234"
const carpetaOrigen = join(directorioBaseUsuario, 'Downloads'); // Si en PC local de cliente falla, establecer ruta absoluta.
const carpetaDestinoConsolidadoVentas = join(__dirname, 'Carpeta Destino', 'Descargas Consolidado Ventas');
const carpetaDestinoDesperdicios = join(__dirname, 'Carpeta Destino', 'Descargas Inventario - Desperdicios');
const carpetaDestinoConsumos = join(__dirname, 'Carpeta Destino', 'Descargas Inventario - Consumos');
const carpetaDestinoDonaciones = join(__dirname, 'Carpeta Destino', 'Descargas Inventario - Donaciones');
const carpetaDestinoCortesia = join(__dirname, 'Carpeta Destino', 'Descargas Inventario - Cortesias');
const carpetaDestinoBodegaPrincipal = join(__dirname, 'Carpeta Destino', 'Descargas Inventario - Bodega Principal');
const localesSeleccionPersonalizada = ['ABAGEAAR', 'ARCCSZAR', 'ARETEAAR', 'BILGEAAR',	'BOTCSZAR',	'CABGEAAR',	'CONTEAAR',	'DOTGEAAR',	'FLOGEAAR',	'FORTEAAR','L51TEAAR',	'LACTEAAR',	'MONTEAAR',	'NORTEAAR','PAUTEAAR',	'PUEGEAAR',	'RIVGEAAR',	'SCATEAAR',	'SFEGEAAR',	'SINTEAAR',	'UNIGEAAR',	'UNITEAAR',	'URITEAAR',	'VUETEAAR']
const localesTodos = ['ABAGEAAR', 'ARCCSZAR', 'ARETEAAR', 'ASUTEAAR', 'AVATEAAR',	'BILGEAAR',	'BOTCSZAR',	'CABGEAAR',	'CONTEAAR',	'DOTGEAAR',	'FLOGEAAR',	'FORTEAAR',	'GORTEAAR',	'L51TEAAR',	'LACTEAAR',	'LIBTEAAR',	'LOMTEAAR',	'MONTEAAR',	'MPSTEAAR',	'NORTEAAR',	'OROTEAAR',	'PAUTEAAR',	'PUEGEAAR',	'RIVGEAAR',	'SARGEAAR',	'SARTEAAR',	'SCATEAAR',	'SFEGEAAR',	'SINTEAAR',	'SPMTEAAR',	'UNIGEAAR',	'UNITEAAR',	'URITEAAR',	'VUETEAAR']
const localesTodosPropios = ['ABAGEAAR', 'ARCCSZAR', 'ARETEAAR', 'BILGEAAR',	'BOTCSZAR',	'CABGEAAR',	'CONTEAAR',	'DOTGEAAR',	'FLOGEAAR',	'FORTEAAR',	'LACTEAAR',	'MONTEAAR',	'NORTEAAR','PAUTEAAR',	'PUEGEAAR',	'RIVGEAAR',	'SCATEAAR',	'SFEGEAAR',	'SINTEAAR',	'UNIGEAAR',	'UNITEAAR',	'URITEAAR',	'VUETEAAR']
const localesTeaConnection = ['ARETEAAR', 'CONTEAAR', 'FORTEAAR', 'LACTEAAR', 'MONTEAAR', 'NORTEAAR', 'PAUTEAAR', 'SCATEAAR', 'SINTEAAR', 'UNITEAAR', 'URITEAAR', 'VUETEAAR']
const localesGreenEat = ['ABAGEAAR', 'BILGEAAR', 'CABGEAAR', 'DOTGEAAR', 'FLOGEAAR', 'PUEGEAAR', 'RIVGEAAR', 'SFEGEAAR', 'UNIGEAAR']
const localesCasaSaenz = [ 'ARCCSZAR', 'BOTCSZAR']
const localesAliadosExternos = [ 'ASUTEAAR', 'AVATEAAR', 'GORTEAAR', 'L51TEAAR', 'LIBTEAAR', 'LOMTEAAR', 'MPSTEAAR', 'OROTEAAR', 'SARGEAAR', 'SARTEAAR'] /* , 'SPMTEAAR'  */
const grupoLocalesSeleccionado = process.argv[2];
const fechaInicio = process.argv[3];
const fechaFinal = process.argv[4];

export {userToteat}
export {passwordToteat}
export {carpetaOrigen}
export {carpetaDestinoConsolidadoVentas}
export {carpetaDestinoDesperdicios}
export {carpetaDestinoConsumos}
export {carpetaDestinoDonaciones}
export {carpetaDestinoCortesia}
export {carpetaDestinoBodegaPrincipal}
export {localesSeleccionPersonalizada}
export {localesTodos}
export {localesTodosPropios}
export {localesTeaConnection}
export {localesGreenEat}
export {localesCasaSaenz}
export {localesAliadosExternos}
export {grupoLocalesSeleccionado}
export {fechaInicio}
export {fechaFinal}

// Agregar proceso de unificacion de un solo excel de salida para Inventarios, agregando nombre de local y armando el archivo alineando por fecha.
// Agregar proceso de unificacion de un solo excel de salida para consolidadoVentas, agregando nombre de local y armando el archivo alineando por fecha.
// Agregar salto de aviso de corte del servicio a  Consolidado Ventas.
// Dar mas seguridad a la descarga en ConsolidadoVentas ya que en algun caso todavia trae el archivo equivocado.


// PEYA
export const carpetaDestinoPeYA = 'C:/Users/PVillanueva/Desktop/Proyectos en Proceso/Descargas Todos Locales Toteat/Carpeta Destino/PeYA - Consolidador Relacion Ventas'
export const localesPeYA = ['CONNECTORS S.A.', "GEA1 S.A.", "Gastronomica San Joaquin SA", "LEMON FLOWERS SA", "EFEDOS SA", "THELONIOUS MONK S.A.", "Chai Tea SA", "OMAKASE SA", "PICHIN LIGHT"]
export const fechaInicioPeYA = process.argv[2];
export const fechaFinalPeYA = process.argv[3];
export const userPeYA = "pvillanueva@grupojaka.com"
export const passwordPeYA = "Pablo2019"


// CLOVER
export const fechaInicioClover = process.argv[2];
export const fechaFinalClover = process.argv[3];
export const userClover = 'pvillanueva@grupojaka.com'
export const passwordClover = '2023@JakaClover'
export const localesClover = ["CASA SAENZ", "CASA SAENZ BOTANICO", "GREEN EAT (Abasto) - Crepe 22 SA", "GREEN EAT (BILG) - Crepe 22 SA", "GREEN EAT (Cabildo)", "GREEN EAT (Dot)", "GREEN EAT (Florida)", "GREEN EAT (PUEG y AB1G)", "GREEN EAT (Rivadavia)", "GREEN EAT (SFEG y BILG)", "Green Eat (Unicenter)", "TEA CONNECTION (Arenales)", "TEA CONNECTION (Conde)", "TEA CONNECTION (Formosa)", "TEA CONNECTION (Lacroze Chai Tea)", "TEA CONNECTION (Montevideo)", "TEA CONNECTION (Paunero)", "TEA CONNECTION (Scalabrini)", "TEA CONNECTION (Sinclair)", "TEA CONNECTION (Unicenter)", "TEA CONNECTION (Uriburu)", "TEA CONNECTION (Vuelta)", "TEA CONNECTION NORDELTA"]
export const carpetaDestinoClover = join(__dirname, 'Carpeta Destino', 'Clover - Ventas Tarjetas');

// VIRAL
export const userViral = 'Administracion'
export const passwordViral = 'Administracion2233'
export const carpetaDestinoViralTeaConnection = join(__dirname,  'Carpeta Destino', 'Descargas Viral Vouchers', 'Tea Connection' )
export const carpetaDestinoViralGreenEat = join(__dirname,  'Carpeta Destino', 'Descargas Viral Vouchers', 'Green Eat' )

export const marca = process.argv[2]; // Tea Connection
export const area = process.argv[3]; // ADM
export const descripcion = process.argv[4];
export const monto = process.argv[5];
export let cant = process.argv[6];