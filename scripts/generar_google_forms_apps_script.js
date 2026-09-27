/**
 * ============================================================================
 * GENERADOR AUTOMATIZADO DE GOOGLE FORMS: DIAGNÓSTICO TERRITORIAL MONAGAS 2026
 * ============================================================================
 * Movimiento Independiente Ganamos Todos (MIGATO) - Estado Monagas
 * Conducción Estratégica: José Gregorio "El Gato" Briceño
 * Responsable Técnico: Ing. Diego Donado
 *
 * Instrucciones de Uso:
 * 1. Abra Google Drive y vaya a https://script.google.com
 * 2. Cree un "Nuevo Proyecto" y pegue este código íntegro en Code.gs
 * 3. Ejecute la función "crearFormularioMaestroMonagas2026()"
 * 4. El formulario quedará creado en su Google Drive con toda la lógica de
 *    ramificación por sectores, condicionales técnicas y enlace al buzón de Telegram.
 * ============================================================================
 */

function crearFormularioMaestroMonagas2026() {
  const MUNICIPIOS_MONAGAS = [
    "Maturín", "Acosta", "Aguasay", "Bolívar", "Caripe", "Cedeño",
    "Ezequiel Zamora", "Libertador", "Piar", "Punceres", "Santa Bárbara",
    "Sotillo", "Uracoa"
  ];

  const ENLACE_TELEGRAM = "https://t.me/MIGATOBuzonMonagas";

  // 1. Crear el Formulario Maestro
  const form = FormApp.create("Monitoreo Ciudadano de Servicios e Infraestructura - Monagas 2026");
  
  form.setDescription(
    "Observatorio Ciudadano para el levantamiento y diagnóstico técnico del estado real " +
    "de los servicios públicos, centros de salud, escuelas e instituciones de emergencia " +
    "en los 13 municipios del estado Monagas.\n\n" +
    "🔒 Confidencialidad Absoluta: Esta encuesta no solicita nombres, cédulas ni datos personales. " +
    "Tiempo estimado: 2 minutos."
  );

  form.setIsQuiz(false);
  form.setCollectEmail(false); // NO recopilar correos para garantizar 100% anonimato
  form.setAllowResponseEdits(false);
  form.setConfirmationMessage(
    "✅ ¡Reporte recibido exitosamente!\n\n" +
    "Su información contribuye de manera decisiva al diagnóstico real y al plan de rescate institucional de Monagas.\n\n" +
    "📸 ¿TIENE FOTOS O VIDEOS DEL ESTADO DEL LUGAR?\n" +
    "Puede enviarlos de manera 100% anónima y segura a nuestro canal de soporte técnico en Telegram:\n" +
    "👉 " + ENLACE_TELEGRAM + "\n\n" +
    "¡Gracias por su compromiso cívico!"
  );

  // ============================================================================
  // SECCIÓN 2: SALUD E INFRAESTRUCTURA ASISTENCIAL (Gaceta 36.579)
  // ============================================================================
  const secSalud = form.addPageBreakItem()
    .setTitle("🏥 Diagnóstico de Salud e Infraestructura Asistencial")
    .setHelpText("Normativa MPPS / Gaceta Oficial N° 36.579. Evaluación del soporte de vida hospitalario.");

  form.addListItem()
    .setTitle("Municipio donde se ubica el centro de salud:")
    .setChoiceValues(MUNICIPIOS_MONAGAS)
    .setRequired(true);

  form.addTextItem()
    .setTitle("Nombre del Centro de Salud (Hospital, Ambulatorio o CDI):")
    .setHelpText("Ej: Hospital Universitario Manuel Núñez Tovar (HUMNT), CDI Los Godos, Ambulatorio José María Vargas...")
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("💧 Suministro de Agua Potable y Presión Hidroneumática:")
    .setChoiceValues([
      "🟢 Continuo 24/7 con presión en todos los niveles (Llega a quirófanos, partos y pisos altos)",
      "🔴 Parcial / Falla de presión en pisos altos (Hay agua en PB/patio, pero NO sube a quirófanos ni hospitalización)",
      "🟡 Racionado / Dependencia de camiones cisterna esporádicos (Sin red continua)",
      "🔴 Inexistente / Centro asistencial totalmente seco"
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("⚡ Planta Eléctrica de Emergencia y Autonomía de Combustible:")
    .setChoiceValues([
      "🟢 Operativa con reserva de gasoil >24h y transferencia automática (Cubre quirófanos y UCI)",
      "🔴 Operativa mecánicamente, pero SIN combustible in situ (Inútil ante un apagón)",
      "🟡 Parcial (Solo bombillos de pasillo y emergencia; no sostiene quirófanos ni incubadoras)",
      "🔴 Averiada / Fuera de servicio",
      "🔴 El centro asistencial no posee planta eléctrica"
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("❄️ Climatización (Aire Acondicionado) en Quirófanos y Salas de Parto:")
    .setChoiceValues([
      "🟢 Operativo a temperatura reglamentaria (18°C - 21°C)",
      "🔴 Dañado en quirófano o partos (Intervenciones suspendidas o riesgo grave de bacterias)",
      "🔴 Sin aire acondicionado en ninguna área del centro asistencial"
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("💨 Red de Oxígeno y Gases Medicinales:")
    .setChoiceValues([
      "🟢 Red centralizada por tubería operativa y con presión continua",
      "🟡 Solo bombonas individuales móviles (Frecuente escasez o faltan manómetros/flujómetros)",
      "🔴 Inexistente (El paciente o familiar debe gestionar y pagar su propia bombona)"
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("🛗 Ascensores y Montacamillas (Para centros con más de una planta):")
    .setChoiceValues([
      "⚪ No aplica (Centro de una sola planta baja)",
      "🟢 Ascensores camilleros operativos y en servicio continuo",
      "🔴 Dañados / Inoperativos (Pacientes deben ser trasladados en brazos o sábanas por escaleras)"
    ])
    .setRequired(true);

  form.addListItem()
    .setTitle("Rol de la Fuente (100% Confidencial):")
    .setChoiceValues([
      "Personal médico / enfermería activo",
      "Personal administrativo / obrero del centro",
      "Paciente o familiar de paciente",
      "Vecino del sector comunitario",
      "Enlace técnico comunitario"
    ])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle("Denuncia u Observaciones Específicas (Opcional):")
    .setHelpText("Medicamentos agotados, filtraciones en techos, salas clausuradas, insumos faltantes...");

  // ============================================================================
  // SECCIÓN 3: PLANTELES EDUCATIVOS Y ESCUELAS (Normas FEDE)
  // ============================================================================
  const secEdu = form.addPageBreakItem()
    .setTitle("🏫 Diagnóstico de Planteles Educativos y Escuelas")
    .setHelpText("Normas Técnicas FEDE / MPPE. Evaluación de infraestructura física, agua y comedor.");

  form.addListItem()
    .setTitle("Municipio donde se ubica el plantel escolar:")
    .setChoiceValues(MUNICIPIOS_MONAGAS)
    .setRequired(true);

  form.addTextItem()
    .setTitle("Parroquia y Sector:")
    .setRequired(true);

  form.addTextItem()
    .setTitle("Nombre del Plantel Educativo / Liceo:")
    .setHelpText("Ej: Escuela Básica República del Uruguay, Liceo Miguel José Sanz...")
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("💧 Suministro de Agua y Baterías de Baños Sanitarios:")
    .setChoiceValues([
      "🟢 Agua continua por red con sanitarios 100% operativos",
      "🟡 Agua intermitente (Cargan agua con tobos para bajar sanitarios)",
      "🔴 Baños clausurados por falta de agua / Estudiantes deben aguantar necesidades",
      "🔴 Letrina o pozo séptico colapsado / Foco de insalubridad"
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("🍲 Comedor Escolar y Programa de Alimentación (PAE):")
    .setChoiceValues([
      "🟢 Comedor activo con gas continuo, agua potable y comida balanceada",
      "🟡 Comedor opera a medias (Cocinan con leña por falta de gas o raciones mínimas de carbohidratos)",
      "🔴 Comedor totalmente clausurado / Sin dotación de alimentos"
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("💡 Red Eléctrica e Iluminación en Aulas:")
    .setChoiceValues([
      "🟢 Aulas con iluminación, cableado y ventiladores operativos",
      "🟡 Parcial (Aulas a oscuras o sin ventilación; calor sofocante)",
      "🔴 Cableado hurtado / El plantel está 100% a oscuras"
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("☂️ Estado de Techos e Impermeabilización:")
    .setChoiceValues([
      "🟢 Techos impermeabilizados sin filtraciones",
      "🟡 Goteras moderadas en algunas aulas en temporada de lluvias",
      "🔴 Filtraciones severas / Caída de losas / Láminas de acerolit desprendidas",
      "🔴 Techo de asbesto fracturado (Riesgo carcinógeno para los niños)"
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("🪑 Mobiliario y Pupitres:")
    .setChoiceValues([
      "🟢 Pupitres suficientes para toda la matrícula estudiantil",
      "🟡 Déficit moderado (Estudiantes deben compartir asientos)",
      "🔴 Déficit crítico (Estudiantes sentados en el piso, toletes o bloques)"
    ])
    .setRequired(true);

  form.addListItem()
    .setTitle("Relación con la Institución Educativa:")
    .setChoiceValues([
      "Docente / Maestro activo",
      "Personal obrero / administrativo",
      "Padre, madre o representante",
      "Estudiante del plantel",
      "Líder comunitario del sector"
    ])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle("Observaciones Adicionales sobre el Plantel:");

  // ============================================================================
  // SECCIÓN 4: BOMBEROS Y PROTECCIÓN CIVIL (Gaceta 40.817 / COVENIN)
  // ============================================================================
  const secBomb = form.addPageBreakItem()
    .setTitle("🚒 Diagnóstico de Bomberos y Protección Civil")
    .setHelpText("Gaceta Oficial N° 40.817. Unidades de extinción de incendios, ambulancias y EPP.");

  form.addListItem()
    .setTitle("Municipio de la Estación:")
    .setChoiceValues(MUNICIPIOS_MONAGAS)
    .setRequired(true);

  form.addTextItem()
    .setTitle("Nombre de la Estación / Subestación:")
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("🚒 Unidades de Supresión de Incendios (Autobombas / Cisternas):")
    .setChoiceValues([
      "🟢 Autobomba operativa con bomba de agua funcional y combustible disponible",
      "🟡 Solo cisterna de acarreo de agua (Sin bomba de alta presión contra incendios)",
      "🔴 Autobomba fuera de servicio por falta de cauchos, baterías o repuestos de motor",
      "🔴 Cero camiones de combate de incendios (Personal sin unidades de respuesta)"
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("🚑 Ambulancias y Unidades de Soporte Asistencial:")
    .setChoiceValues([
      "🟢 Ambulancia operativa con dotación de soporte vital y combustible",
      "🟡 Ambulancia mecánicamente operativa pero sin asignación de combustible",
      "🔴 Ambulancias inoperativas / Fuera de servicio",
      "🔴 La estación no dispone de ambulancia"
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("🧑‍🚒 Equipos de Protección Personal (EPP: Chaquetones, Botas, Cascos):")
    .setChoiceValues([
      "🟢 Dotación completa de chaquetón, casco y botas ignífugas normadas para toda la guardia",
      "🟡 EPP desgastado, roto o insuficiente (Bomberos deben turnarse los trajes)",
      "🔴 Sin trajes de combate de incendios (Combaten con ropa de civil o uniformes de tela)"
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("🤿 Equipos de Respiración Autónoma (ERA) y Recarga de Aire:")
    .setChoiceValues([
      "🟢 Cilindros ERA presurizados con compresor de aire respirable operativo",
      "🟡 Cilindros existentes pero sin compresor de recarga funcional en el estado",
      "🔴 Cero equipos de respiración autónoma (Imposible ingresar a estructuras con humo)"
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("✂️ Herramientas Hidráulicas de Rescate Vehicular (Quijadas de la Vida):")
    .setChoiceValues([
      "🟢 Equipo hidráulico de corte y separación operativo con motor funcional",
      "🔴 Quijadas de la vida dañadas por falta de mangueras hidráulicas o mantenimiento",
      "🔴 No poseen herramientas de extricación (Usan seguetas o palancas rudimentarias)"
    ])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle("Observaciones sobre la Estación Bomberil / PC:");

  // ============================================================================
  // SECCIÓN 5: SEGURIDAD CIUDADANA Y MÓDULOS POLICIALES (Gaceta 39.390)
  // ============================================================================
  const secPol = form.addPageBreakItem()
    .setTitle("🛡️ Diagnóstico de Seguridad Ciudadana y Módulos Policiales")
    .setHelpText("Gaceta Oficial N° 39.390. Capacidad de patrullaje preventivo y estado de módulos.");

  form.addListItem()
    .setTitle("Municipio del Módulo Policial:")
    .setChoiceValues(MUNICIPIOS_MONAGAS)
    .setRequired(true);

  form.addTextItem()
    .setTitle("Nombre o Ubicación del Módulo / Cuadrante de Paz:")
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("🚓 Parque Automotor para Patrullaje Preventivo:")
    .setChoiceValues([
      "🟢 Patrullas 4x4 y motocicletas en servicio con cuota de combustible",
      "🟡 Solo 1 o 2 motocicletas operativas (Sin unidades para traslado de detenidos)",
      "🔴 Cero vehículos operativos (Patrullaje a pie exclusivo o estacionarios)"
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("🏢 Estado Físico del Módulo / Puesto de Vigilancia:")
    .setChoiceValues([
      "🟢 Instalaciones en buen estado con servicios básicos activos",
      "🟡 Sin agua de tubería, baños precarios o techos con filtraciones",
      "🔴 Módulo en ruinas, desvalijado o clausurado"
    ])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle("Observaciones sobre la Seguridad del Sector:");

  // ============================================================================
  // SECCIÓN 6: AGUA POTABLE, POZOS PROFUNDOS Y ACUEDUCTOS (Gaceta 36.395)
  // ============================================================================
  const secAgua = form.addPageBreakItem()
    .setTitle("💧 Diagnóstico de Agua Potable, Pozos y Acueductos")
    .setHelpText("Gaceta Oficial N° 36.395. Estado de bombas sumergibles, plantas y calidad del agua.");

  form.addListItem()
    .setTitle("Municipio donde se ubica la falla de agua:")
    .setChoiceValues(MUNICIPIOS_MONAGAS)
    .setRequired(true);

  form.addTextItem()
    .setTitle("Parroquia y Sector Afectado:")
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("⚙️ Estado Electromecánico de la Bomba / Motor del Pozo:")
    .setChoiceValues([
      "🟢 Bomba y tablero eléctrico 100% operativos con caudal normal",
      "🟡 Operativa pero con fluctuaciones eléctricas o bajo caudal (Bomba perdiendo vida útil)",
      "🔴 Bomba sumergible quemada / Tablero de control dañado o desvalijado"
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("🧪 Calidad del Agua y Cloración:")
    .setChoiceValues([
      "🟢 Dosificación continua de cloro y agua cristalina apta para consumo",
      "🟡 Agua cruda directa sin cloración (Riesgo bacteriológico)",
      "🔴 Agua con olor fétido, sedimentos o color amarillento/marrón"
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("🚰 Continuidad del Suministro en los Hogares:")
    .setChoiceValues([
      "🟢 Agua directa por tubería las 24 horas del día",
      "🟡 Racionamiento por horarios (Llega pocas horas o días interdiarios)",
      "🔴 Comunidad sin agua por tubería por más de 15 días continuos"
    ])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle("Detalles del Pozo o Comunidad Afectada:");

  // ============================================================================
  // CONFIGURAR LA RAMIFICACIÓN EN LA SECCIÓN 1 (PREGUNTA MAESTRA)
  // ============================================================================
  // La pregunta maestra en la primera página salta a la sección elegida
  const itemSector = form.addMultipleChoiceItem();
  itemSector.setTitle("Seleccione el sector que desea evaluar:")
    .setHelpText("Elija el área correspondiente para desplegar las preguntas específicas de su sector.")
    .setRequired(true);

  itemSector.setChoices([
    itemSector.createChoice("🏥 Salud e Infraestructura Hospitalaria", secSalud),
    itemSector.createChoice("🏫 Educación y Planteles Escolares", secEdu),
    itemSector.createChoice("🚒 Cuerpos de Bomberos y Protección Civil", secBomb),
    itemSector.createChoice("🛡️ Módulos Policiales y Seguridad Ciudadana", secPol),
    itemSector.createChoice("💧 Agua Potable, Pozos y Acueductos", secAgua)
  ]);

  // Mover la pregunta de selección de sector al inicio (antes de los saltos de sección)
  form.moveItem(itemSector.getIndex(), 0);

  // Registrar URLs en la consola de Google Apps Script
  Logger.log("=== FORMULARIO MAESTRO MONAGAS 2026 CREADO EXITOSAMENTE ===");
  Logger.log("URL de Edición: " + form.getEditUrl());
  Logger.log("URL Pública para Compartir: " + form.getPublishedUrl());
}
