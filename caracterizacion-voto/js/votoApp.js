/**
 * Controlador de Aplicación: Caracterización del Voto • MIGATO
 * Técnica Electoral • Alto de Los Godos
 */

import { SUBPARROQUIAS_GODOS, VotoStore } from "./votoData.js";

class VotoApp {
  constructor() {
    this.store = new VotoStore();
    this.centrosGodos = [];
    this.votoSeleccionado = "duro"; // Default
    this.activeTab = "captura"; // 'captura' | 'sabana' | 'impresion'
    this.filtroClasificacion = "todos";
    this.filtroSubParroquia = "todos";
    this.filtroCentro = "todos";
    this.filtroBusqueda = "";

    this.init();
  }

  init() {
    this.cargarCentrosCNE();
    this.poblarSubParroquias();
    this.poblarCentros();
    this.vincularEventos();
    this.actualizarUI();
  }

  cargarCentrosCNE() {
    if (typeof window !== "undefined" && window.CENTROS_MATURIN) {
      // Filtrar centros de Alto de Los Godos
      this.centrosGodos = window.CENTROS_MATURIN.filter(c => 
        (c.parroquia && c.parroquia.includes("godos")) ||
        (c.parroquiaNombre && c.parroquiaNombre.toLowerCase().includes("godos"))
      );
    }
  }

  poblarSubParroquias() {
    const selectForm = document.getElementById("form-subparroquia");
    const selectFiltro = document.getElementById("filtro-subparroquia");

    if (selectForm) {
      selectForm.innerHTML = `<option value="">-- Selecciona Sub-Parroquia / Eje --</option>`;
      SUBPARROQUIAS_GODOS.forEach(sp => {
        const opt = document.createElement("option");
        opt.value = sp.nombre;
        opt.textContent = sp.nombre;
        selectForm.appendChild(opt);
      });
      // Preseleccionar La Puente por defecto
      selectForm.value = SUBPARROQUIAS_GODOS[0].nombre;
      this.actualizarSectoresForm(SUBPARROQUIAS_GODOS[0].nombre);
    }

    if (selectFiltro) {
      selectFiltro.innerHTML = `<option value="todos">Todas las Sub-Parroquias</option>`;
      SUBPARROQUIAS_GODOS.forEach(sp => {
        const opt = document.createElement("option");
        opt.value = sp.nombre;
        opt.textContent = sp.nombre;
        selectFiltro.appendChild(opt);
      });
    }
  }

  actualizarSectoresForm(subParroquiaNombre) {
    const selectSector = document.getElementById("form-sector");
    if (!selectSector) return;

    const sp = SUBPARROQUIAS_GODOS.find(s => s.nombre === subParroquiaNombre);
    selectSector.innerHTML = `<option value="">-- Selecciona Sector / Comunidad --</option>`;

    if (sp && sp.sectores) {
      sp.sectores.forEach(sec => {
        const opt = document.createElement("option");
        opt.value = sec;
        opt.textContent = sec;
        selectSector.appendChild(opt);
      });
    }
    // Opción para sector personalizado
    const optOtro = document.createElement("option");
    optOtro.value = "__otro__";
    optOtro.textContent = "➕ Otro sector (Escribir a mano)...";
    selectSector.appendChild(optOtro);

    // Sugerir centro electoral principal si existe
    if (sp && sp.centroPrincipal) {
      const selectCentro = document.getElementById("form-centro");
      if (selectCentro) {
        // Buscar si existe en las opciones
        for (let i = 0; i < selectCentro.options.length; i++) {
          if (selectCentro.options[i].text.includes(sp.centroPrincipal)) {
            selectCentro.selectedIndex = i;
            break;
          }
        }
      }
    }
  }

  poblarCentros() {
    const selectForm = document.getElementById("form-centro");
    const selectFiltro = document.getElementById("filtro-centro");

    let lista = this.centrosGodos;
    // Si por alguna razón la lista está vacía, usamos los centros de las sub-parroquias
    if (!lista || lista.length === 0) {
      lista = [
        { nombre: "Cruz Hernández Quijada", electores: 2890 },
        { nombre: "Centro De Educación Inicial Alto De Los Godos I", electores: 1043 },
        { nombre: "Centro De Formación Integral Para El Trabajo", electores: 1749 },
        { nombre: "Centro De Votacion San Rafael", electores: 1266 },
        { nombre: "Centro De Votación Brisas De Venezuela", electores: 644 },
        { nombre: "Centro De Votación La Pastora", electores: 492 },
        { nombre: "Centro De Votación Sagrado Corazon De Jesus Ii", electores: 813 },
        { nombre: "Centro Del Niño Y La Familia Bolivariano Nuevo Horizonte", electores: 1985 },
        { nombre: "Centro Del Niño Y La Familia Bolivariano Prado Del Sur", electores: 1754 },
        { nombre: "Centro Del Niño Y La Familia Simoncito Moscu", electores: 1229 }
      ];
    }

    if (selectForm) {
      selectForm.innerHTML = `<option value="">-- Selecciona Centro Electoral CNE --</option>`;
      lista.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.nombre;
        opt.textContent = `${c.nombre} (${c.electores || 0} electores)`;
        selectForm.appendChild(opt);
      });
      if (selectForm.options.length > 1) {
        selectForm.selectedIndex = 1;
      }
    }

    if (selectFiltro) {
      selectFiltro.innerHTML = `<option value="todos">Todos los Centros CNE</option>`;
      lista.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.nombre;
        opt.textContent = c.nombre;
        selectFiltro.appendChild(opt);
      });
    }
  }

  vincularEventos() {
    // 1. Selector de Sub-Parroquia en formulario
    const selectSp = document.getElementById("form-subparroquia");
    if (selectSp) {
      selectSp.addEventListener("change", (e) => {
        this.actualizarSectoresForm(e.target.value);
      });
    }

    // 2. Selector de Sector (Otro)
    const selectSec = document.getElementById("form-sector");
    const wrapOtro = document.getElementById("wrapper-otro-sector");
    if (selectSec && wrapOtro) {
      selectSec.addEventListener("change", (e) => {
        if (e.target.value === "__otro__") {
          wrapOtro.classList.remove("hidden");
          document.getElementById("input-otro-sector").focus();
        } else {
          wrapOtro.classList.add("hidden");
        }
      });
    }

    // 3. Botones de Clasificación de Voto (Duro, Blando, Nuevo)
    const btnDuro = document.getElementById("btn-voto-duro");
    const btnBlando = document.getElementById("btn-voto-blando");
    const btnNuevo = document.getElementById("btn-voto-nuevo");

    const setVoto = (tipo) => {
      this.votoSeleccionado = tipo;
      [btnDuro, btnBlando, btnNuevo].forEach(b => {
        if (b) {
          b.classList.remove("ring-4", "ring-emerald-400", "ring-amber-400", "ring-sky-400", "shadow-xl", "scale-105");
          b.classList.add("opacity-60");
        }
      });

      if (tipo === "duro" && btnDuro) {
        btnDuro.classList.remove("opacity-60");
        btnDuro.classList.add("ring-4", "ring-emerald-400", "shadow-xl", "scale-105");
      } else if (tipo === "blando" && btnBlando) {
        btnBlando.classList.remove("opacity-60");
        btnBlando.classList.add("ring-4", "ring-amber-400", "shadow-xl", "scale-105");
      } else if (tipo === "nuevo" && btnNuevo) {
        btnNuevo.classList.remove("opacity-60");
        btnNuevo.classList.add("ring-4", "ring-sky-400", "shadow-xl", "scale-105");
      }
    };

    if (btnDuro) btnDuro.addEventListener("click", () => setVoto("duro"));
    if (btnBlando) btnBlando.addEventListener("click", () => setVoto("blando"));
    if (btnNuevo) btnNuevo.addEventListener("click", () => setVoto("nuevo"));
    setVoto("duro"); // Iniciar con Voto Duro activo

    // 4. Formulario de Captura
    const form = document.getElementById("form-caracterizacion");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.procesarGuardado();
      });
    }

    // 5. Tabs de Navegación
    const tabCaptura = document.getElementById("tab-btn-captura");
    const tabSabana = document.getElementById("tab-btn-sabana");
    const tabImpresion = document.getElementById("tab-btn-impresion");

    if (tabCaptura) tabCaptura.addEventListener("click", () => this.cambiarTab("captura"));
    if (tabSabana) tabSabana.addEventListener("click", () => this.cambiarTab("sabana"));
    if (tabImpresion) tabImpresion.addEventListener("click", () => this.cambiarTab("impresion"));

    // 6. Filtros de Sábana
    const filtroVoto = document.getElementById("filtro-voto-group");
    if (filtroVoto) {
      filtroVoto.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-filter-voto]");
        if (btn) {
          filtroVoto.querySelectorAll("button").forEach(b => {
            b.classList.remove("bg-sky-600", "text-white", "font-black");
            b.classList.add("bg-[#140e40]", "text-blue-200", "border", "border-[#2d1f85]");
          });
          btn.classList.remove("bg-[#140e40]", "text-blue-200", "border", "border-[#2d1f85]");
          btn.classList.add("bg-sky-600", "text-white", "font-black");
          this.filtroClasificacion = btn.getAttribute("data-filter-voto");
          this.renderTablaSabana();
        }
      });
    }

    const inputBusqueda = document.getElementById("filtro-busqueda");
    if (inputBusqueda) {
      inputBusqueda.addEventListener("input", (e) => {
        this.filtroBusqueda = e.target.value;
        this.renderTablaSabana();
      });
    }

    const filtroSp = document.getElementById("filtro-subparroquia");
    if (filtroSp) {
      filtroSp.addEventListener("change", (e) => {
        this.filtroSubParroquia = e.target.value;
        this.renderTablaSabana();
      });
    }

    const filtroCe = document.getElementById("filtro-centro");
    if (filtroCe) {
      filtroCe.addEventListener("change", (e) => {
        this.filtroCentro = e.target.value;
        this.renderTablaSabana();
      });
    }

    // 7. Acciones de Exportación e Impresión
    this.vincularImportacionMasiva();

    const btnExportar = document.getElementById("btn-exportar-csv");
    if (btnExportar) {
      btnExportar.addEventListener("click", () => {
        const filtrados = this.obtenerFiltrados();
        this.store.exportarCSV(filtrados);
      });
    }

    const btnImprimir = document.getElementById("btn-imprimir-planilla");
    if (btnImprimir) {
      btnImprimir.addEventListener("click", () => {
        window.print();
      });
    }

    const btnRestaurarDemo = document.getElementById("btn-restaurar-demo");
    if (btnRestaurarDemo) {
      btnRestaurarDemo.addEventListener("click", () => {
        if (confirm("¿Deseas restaurar la lista de demostración de Alto de Los Godos (16 electores)?")) {
          this.store.restaurarDemo();
          this.actualizarUI();
          this.mostrarToast("Base de datos restaurada con datos de demostración.");
        }
      });
    }

    const btnLimpiarTodos = document.getElementById("btn-limpiar-todos");
    if (btnLimpiarTodos) {
      btnLimpiarTodos.addEventListener("click", () => {
        if (confirm("ATENCIÓN: ¿Seguro que deseas vaciar toda la lista para empezar una recolección real limpia?")) {
          this.store.limpiarTodos();
          this.actualizarUI();
          this.mostrarToast("Base de datos vaciada. Lista para nueva jornada.");
        }
      });
    }
  }

  cambiarTab(tabName) {
    this.activeTab = tabName;

    const vistaCaptura = document.getElementById("vista-captura");
    const vistaSabana = document.getElementById("vista-sabana");
    const vistaImpresion = document.getElementById("vista-impresion");

    const tabBtnCaptura = document.getElementById("tab-btn-captura");
    const tabBtnSabana = document.getElementById("tab-btn-sabana");
    const tabBtnImpresion = document.getElementById("tab-btn-impresion");

    [vistaCaptura, vistaSabana, vistaImpresion].forEach(v => {
      if (v) v.classList.add("hidden");
    });
    [tabBtnCaptura, tabBtnSabana, tabBtnImpresion].forEach(b => {
      if (b) {
        b.classList.remove("border-amber-400", "text-amber-400", "bg-[#23176d]");
        b.classList.add("border-transparent", "text-blue-200", "hover:text-white", "hover:bg-[#1d1554]");
      }
    });

    if (tabName === "captura" && vistaCaptura && tabBtnCaptura) {
      vistaCaptura.classList.remove("hidden");
      tabBtnCaptura.classList.add("border-amber-400", "text-amber-400", "bg-[#23176d]");
      tabBtnCaptura.classList.remove("border-transparent", "text-blue-200");
    } else if (tabName === "sabana" && vistaSabana && tabBtnSabana) {
      vistaSabana.classList.remove("hidden");
      tabBtnSabana.classList.add("border-amber-400", "text-amber-400", "bg-[#23176d]");
      tabBtnSabana.classList.remove("border-transparent", "text-blue-200");
      this.renderTablaSabana();
    } else if (tabName === "impresion" && vistaImpresion && tabBtnImpresion) {
      vistaImpresion.classList.remove("hidden");
      tabBtnImpresion.classList.add("border-amber-400", "text-amber-400", "bg-[#23176d]");
      tabBtnImpresion.classList.remove("border-transparent", "text-blue-200");
      this.renderPlanillaImprimible();
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  procesarGuardado() {
    const nombre = document.getElementById("form-nombre").value.trim();
    const tipoDoc = document.getElementById("form-tipo-doc").value;
    const numDoc = document.getElementById("form-cedula").value.trim();
    const telefono = document.getElementById("form-telefono").value.trim();
    const subParroquia = document.getElementById("form-subparroquia").value;
    let sector = document.getElementById("form-sector").value;
    if (sector === "__otro__") {
      sector = document.getElementById("input-otro-sector").value.trim();
    }
    const centro = document.getElementById("form-centro").value;
    const edad = document.getElementById("form-edad").value.trim();
    const profesion = document.getElementById("form-profesion").value.trim();

    if (!nombre) {
      alert("Por favor ingresa Nombre y Apellido.");
      return;
    }
    if (!numDoc) {
      alert("Por favor ingresa la Cédula del elector.");
      return;
    }

    const cedulaCompleta = `${tipoDoc}-${numDoc}`;

    // Validar duplicado de cédula
    const yaExiste = this.store.electores.find(e => e.cedula === cedulaCompleta);
    if (yaExiste) {
      if (!confirm(`La cédula ${cedulaCompleta} ya se encuentra registrada a nombre de "${yaExiste.nombreApellido}". ¿Deseas registrarla nuevamente?`)) {
        return;
      }
    }

    const nuevoVotante = this.store.agregarVotante({
      nombreApellido: nombre,
      cedula: cedulaCompleta,
      telefono: telefono,
      subParroquia: subParroquia,
      sector: sector,
      centroElectoral: centro,
      edad: edad,
      profesion: profesion,
      clasificacionVoto: this.votoSeleccionado
    });

    this.mostrarToast(`✅ Elector N° ${nuevoVotante.correlativo} (${nuevoVotante.nombreApellido}) guardado como Voto ${this.votoSeleccionado.toUpperCase()}`);

    // Limpieza inteligente:
    // Limpiamos los datos del elector (nombre, cédula, teléfono, edad, profesión),
    // pero MANTENEMOS sub-parroquia, sector y centro electoral para cargar rápido al siguiente vecino de la casa/calle!
    document.getElementById("form-nombre").value = "";
    document.getElementById("form-cedula").value = "";
    document.getElementById("form-telefono").value = "";
    document.getElementById("form-edad").value = "";
    document.getElementById("form-profesion").value = "";
    document.getElementById("form-nombre").focus();

    this.actualizarUI();
  }

  obtenerFiltrados() {
    return this.store.listarVotantes({
      clasificacion: this.filtroClasificacion,
      subParroquia: this.filtroSubParroquia,
      centroElectoral: this.filtroCentro,
      busqueda: this.filtroBusqueda
    });
  }

  actualizarUI() {
    this.renderKPIs();
    this.renderTablaSabana();
    this.renderPlanillaImprimible();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  renderKPIs() {
    const stats = this.store.calcularEstadisticas();

    const elTotal = document.getElementById("kpi-total-electores");
    const elDuros = document.getElementById("kpi-voto-duro");
    const elDurosPct = document.getElementById("kpi-voto-duro-pct");
    const elBlandos = document.getElementById("kpi-voto-blando");
    const elBlandosPct = document.getElementById("kpi-voto-blando-pct");
    const elNuevos = document.getElementById("kpi-voto-nuevo");
    const elNuevosPct = document.getElementById("kpi-voto-nuevo-pct");
    const elEdad = document.getElementById("kpi-edad-promedio");

    if (elTotal) elTotal.textContent = stats.total;
    if (elDuros) elDuros.textContent = stats.duros;
    if (elDurosPct) elDurosPct.textContent = `${stats.durosPct}%`;
    if (elBlandos) elBlandos.textContent = stats.blandos;
    if (elBlandosPct) elBlandosPct.textContent = `${stats.blandosPct}%`;
    if (elNuevos) elNuevos.textContent = stats.nuevos;
    if (elNuevosPct) elNuevosPct.textContent = `${stats.nuevosPct}%`;
    if (elEdad) elEdad.textContent = stats.edadPromedio ? `${stats.edadPromedio} años` : "--";

    // Contadores en los badges de los filtros
    const badgeTodos = document.getElementById("badge-count-todos");
    const badgeDuros = document.getElementById("badge-count-duros");
    const badgeBlandos = document.getElementById("badge-count-blandos");
    const badgeNuevos = document.getElementById("badge-count-nuevos");

    if (badgeTodos) badgeTodos.textContent = stats.total;
    if (badgeDuros) badgeDuros.textContent = stats.duros;
    if (badgeBlandos) badgeBlandos.textContent = stats.blandos;
    if (badgeNuevos) badgeNuevos.textContent = stats.nuevos;
  }

  renderTablaSabana() {
    const tbody = document.getElementById("tbody-sabana-electoral");
    if (!tbody) return;

    const lista = this.obtenerFiltrados();
    const countFiltrados = document.getElementById("count-registros-filtrados");
    if (countFiltrados) {
      countFiltrados.textContent = `${lista.length} de ${this.store.electores.length} electores`;
    }

    if (this.store.electores.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="py-14 text-center text-blue-200 bg-[#140e40]/60">
            <div class="max-w-md mx-auto space-y-2">
              <i data-lucide="users" class="w-8 h-8 text-amber-400 mx-auto"></i>
              <p class="text-sm font-bold text-white">No hay electores registrados aún</p>
              <p class="text-xs text-blue-300/70">Utilice el formulario superior para registrar al primer elector de campo con su clasificación oficial (Duro, Blando o Nuevo).</p>
            </div>
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    if (lista.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="py-12 text-center text-blue-200 bg-[#140e40]/60">
            <div class="max-w-sm mx-auto space-y-2">
              <i data-lucide="search-x" class="w-8 h-8 text-blue-400 mx-auto"></i>
              <p class="text-sm font-bold text-white">No se encontraron electores</p>
              <p class="text-xs text-blue-300/70">Prueba ajustando los filtros de búsqueda o cambia el tipo de voto.</p>
            </div>
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    tbody.innerHTML = lista.map((e, index) => {
      // Badges para las 3 subcolumnas de Clasificación del Voto
      const esDuro = e.clasificacionVoto === "duro";
      const esBlando = e.clasificacionVoto === "blando";
      const esNuevo = e.clasificacionVoto === "nuevo";

      // Formatear teléfono para enlace directo de WhatsApp
      let enlaceWhatsapp = "";
      if (e.telefono) {
        const soloDigitos = e.telefono.replace(/\D/g, "");
        if (soloDigitos.length >= 10) {
          const codPais = soloDigitos.startsWith("58") ? soloDigitos : `58${soloDigitos.replace(/^0/, "")}`;
          enlaceWhatsapp = `https://wa.me/${codPais}?text=Hola%20${encodeURIComponent(e.nombreApellido)},%20te%20saludamos%20del%20Comando%20MIGATO%20Alto%20de%20Los%20Godos`;
        }
      }

      return `
        <tr class="border-b border-[#2d1f85]/60 hover:bg-[#1d1554]/50 transition group text-xs">
          <!-- 1. N° Correlativo -->
          <td class="py-3 px-3 font-mono font-black text-amber-400 text-center bg-[#140e40]/70">
            ${index + 1}
          </td>

          <!-- 2. Nombre y Apellido -->
          <td class="py-3 px-3 font-bold text-white whitespace-nowrap">
            <div class="flex items-center gap-2">
              <span>${e.nombreApellido}</span>
              ${enlaceWhatsapp ? `
                <a href="${enlaceWhatsapp}" target="_blank" rel="noopener noreferrer" class="p-1 rounded bg-emerald-950/80 text-emerald-400 hover:bg-emerald-800 transition" title="Enviar WhatsApp a ${e.nombreApellido}">
                  <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
                </a>
              ` : ""}
            </div>
          </td>

          <!-- 3. Cédula -->
          <td class="py-3 px-3 font-mono font-bold text-sky-300 whitespace-nowrap">
            ${e.cedula}
          </td>

          <!-- 4. Teléfono -->
          <td class="py-3 px-3 font-mono text-blue-200 whitespace-nowrap">
            ${e.telefono || '<span class="text-blue-300/40">--</span>'}
          </td>

          <!-- 5. Sub-Parroquia -->
          <td class="py-3 px-3 text-blue-200">
            <span class="px-2 py-0.5 rounded-md bg-[#140e40] border border-[#2d1f85] text-[11px] font-semibold block truncate max-w-[180px]" title="${e.subParroquia}">
              ${e.subParroquia.replace("Sub-Parroquia ", "SP ")}
            </span>
          </td>

          <!-- 6. Centro Electoral CNE -->
          <td class="py-3 px-3 text-blue-100">
            <span class="block truncate max-w-[200px] font-medium" title="${e.centroElectoral}">
              ${e.centroElectoral}
            </span>
          </td>

          <!-- 7. Sector -->
          <td class="py-3 px-3 font-semibold text-amber-300 whitespace-nowrap">
            ${e.sector || '<span class="text-blue-300/40">--</span>'}
          </td>

          <!-- 8. Edad -->
          <td class="py-3 px-3 font-mono text-center font-bold text-white">
            ${e.edad || '<span class="text-blue-300/40">--</span>'}
          </td>

          <!-- 9. Profesión -->
          <td class="py-3 px-3 text-blue-200 truncate max-w-[150px]" title="${e.profesion}">
            ${e.profesion || '<span class="text-blue-300/40">--</span>'}
          </td>

          <!-- 10. Clasificación del Voto (Subdividido en Duro, Blando, Nuevo) -->
          <td class="py-2.5 px-3">
            <div class="flex items-center gap-1.5 justify-center">
              <!-- Duro -->
              <span class="w-7 h-7 rounded-lg font-black font-mono flex items-center justify-center text-[11px] transition ${
                esDuro 
                  ? "bg-emerald-500 text-[#0e092e] shadow-md shadow-emerald-500/30 font-extrabold" 
                  : "bg-[#140e40] text-blue-400/40 border border-[#2d1f85]"
              }" title="Voto Duro">
                ${esDuro ? "✓" : "·"}
              </span>

              <!-- Blando -->
              <span class="w-7 h-7 rounded-lg font-black font-mono flex items-center justify-center text-[11px] transition ${
                esBlando 
                  ? "bg-amber-500 text-[#0e092e] shadow-md shadow-amber-500/30 font-extrabold" 
                  : "bg-[#140e40] text-blue-400/40 border border-[#2d1f85]"
              }" title="Voto Blando (Persuasión)">
                ${esBlando ? "✓" : "·"}
              </span>

              <!-- Nuevo -->
              <span class="w-7 h-7 rounded-lg font-black font-mono flex items-center justify-center text-[11px] transition ${
                esNuevo 
                  ? "bg-sky-400 text-[#0e092e] shadow-md shadow-sky-400/30 font-extrabold" 
                  : "bg-[#140e40] text-blue-400/40 border border-[#2d1f85]"
              }" title="Voto Nuevo (Juventud)">
                ${esNuevo ? "✓" : "·"}
              </span>

              <!-- Botón Eliminar -->
              <button type="button" class="ml-2 text-blue-400/50 hover:text-rose-400 transition p-1 cursor-pointer" title="Eliminar registro" onclick="window.votoApp.eliminarRegistro('${e.id}')">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  eliminarRegistro(id) {
    const item = this.store.electores.find(e => e.id === id);
    if (!item) return;

    if (confirm(`¿Eliminar a ${item.nombreApellido} (${item.cedula}) de la caracterización?`)) {
      this.store.eliminarVotante(id);
      this.actualizarUI();
      this.mostrarToast("Registro eliminado con éxito.");
    }
  }

  renderPlanillaImprimible() {
    const tbody = document.getElementById("tbody-planilla-print");
    if (!tbody) return;

    const lista = this.obtenerFiltrados();
    // Para que la hoja impresa quede completa, completamos hasta 20 filas si hay menos
    const totalFilas = Math.max(lista.length, 15);

    let rowsHtml = "";
    for (let i = 0; i < totalFilas; i++) {
      const e = lista[i];
      if (e) {
        rowsHtml += `
          <tr class="border-b border-black text-[11px]">
            <td class="border-r border-black p-1 text-center font-bold font-mono">${i + 1}</td>
            <td class="border-r border-black p-1 font-bold truncate">${e.nombreApellido}</td>
            <td class="border-r border-black p-1 font-mono text-center">${e.cedula}</td>
            <td class="border-r border-black p-1 font-mono text-center">${e.telefono || ""}</td>
            <td class="border-r border-black p-1 text-center truncate">${(e.subParroquia || "").replace("Sub-Parroquia ", "SP ")}</td>
            <td class="border-r border-black p-1 truncate">${e.centroElectoral}</td>
            <td class="border-r border-black p-1 truncate">${e.sector || ""}</td>
            <td class="border-r border-black p-1 text-center font-mono">${e.edad || ""}</td>
            <td class="border-r border-black p-1 truncate">${e.profesion || ""}</td>
            <td class="border-r border-black p-1 text-center font-black">${e.clasificacionVoto === "duro" ? "X" : ""}</td>
            <td class="border-r border-black p-1 text-center font-black">${e.clasificacionVoto === "blando" ? "X" : ""}</td>
            <td class="p-1 text-center font-black">${e.clasificacionVoto === "nuevo" ? "X" : ""}</td>
          </tr>
        `;
      } else {
        // Fila vacía para rellenar a mano
        rowsHtml += `
          <tr class="border-b border-black text-[11px] h-8">
            <td class="border-r border-black p-1 text-center font-mono text-slate-400">${i + 1}</td>
            <td class="border-r border-black p-1"></td>
            <td class="border-r border-black p-1"></td>
            <td class="border-r border-black p-1"></td>
            <td class="border-r border-black p-1"></td>
            <td class="border-r border-black p-1"></td>
            <td class="border-r border-black p-1"></td>
            <td class="border-r border-black p-1"></td>
            <td class="border-r border-black p-1"></td>
            <td class="border-r border-black p-1"></td>
            <td class="border-r border-black p-1"></td>
            <td class="p-1"></td>
          </tr>
        `;
      }
    }

    tbody.innerHTML = rowsHtml;
  }

  vincularImportacionMasiva() {
    const modal = document.getElementById("modal-importar-csv");
    const btnAbrir = document.getElementById("btn-importar-csv");
    const btnCerrar = document.getElementById("btn-cerrar-modal-importar");
    const btnCancelar = document.getElementById("btn-modal-cancelar");
    const btnDescargarPlantilla = document.getElementById("btn-modal-descargar-plantilla");
    const dropzone = document.getElementById("dropzone-modal-importar");
    const inputArchivo = document.getElementById("input-modal-archivo");
    const labelArchivo = document.getElementById("label-modal-archivo");
    const textareaPegado = document.getElementById("textarea-modal-pegado");
    const btnLimpiar = document.getElementById("btn-modal-limpiar-texto");
    const btnAnalizar = document.getElementById("btn-modal-analizar");
    const btnConfirmar = document.getElementById("btn-modal-confirmar-inyeccion");
    const textConfirmar = document.getElementById("text-modal-confirmar");
    const wrapperPreview = document.getElementById("wrapper-modal-preview");
    const tbodyPreview = document.getElementById("tbody-modal-preview");

    this.masivoValidos = [];

    const abrirModal = () => {
      if (modal) modal.classList.remove("hidden");
      if (window.lucide) window.lucide.createIcons();
    };

    const cerrarModal = () => {
      if (modal) modal.classList.add("hidden");
    };

    if (btnAbrir) btnAbrir.addEventListener("click", abrirModal);
    if (btnCerrar) btnCerrar.addEventListener("click", cerrarModal);
    if (btnCancelar) btnCancelar.addEventListener("click", cerrarModal);

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) cerrarModal();
      });
    }

    if (btnDescargarPlantilla) {
      btnDescargarPlantilla.addEventListener("click", () => {
        const headers = ["Nombre y Apellido", "Cedula", "Telefono", "Voto (duro/blando/nuevo)", "Edad", "Profesion", "Sector", "Subparroquia", "Centro Electoral"];
        const rows = [
          ["CARLOS ALBERTO RONDON", "V-14892410", "0414-7891234", "duro", "38", "Docente", "Villa de los Ángeles", "Sub-Parroquia 6 • La Puente (Eje Central)", "Cruz Hernández Quijada"],
          ["MARIA ELENA SALAZAR", "V-18942310", "0424-9123456", "blando", "42", "Comerciante", "La Puente Sector 1 (Plaza)", "Sub-Parroquia 6 • La Puente (Eje Central)", "Cruz Hernández Quijada"],
          ["JOSE GREGORIO MARTINEZ", "V-26123456", "0416-5551234", "nuevo", "21", "Estudiante", "Monagzal", "Sub-Parroquia 6 • La Puente (Eje Central)", "U.E. Gregorio Rondón"]
        ];
        const BOM = "\uFEFF";
        const csvContent = BOM + [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\r\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `plantilla_electores_central_MIGATO.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }

    if (inputArchivo) {
      inputArchivo.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (labelArchivo) labelArchivo.textContent = `Archivo: ${file.name}`;
        const reader = new FileReader();
        reader.onload = (evt) => {
          const text = evt.target.result;
          if (textareaPegado) textareaPegado.value = text;
          analizarDatos(text);
        };
        reader.readAsText(file, "UTF-8");
      });
    }

    if (dropzone) {
      ["dragenter", "dragover"].forEach(evtName => {
        dropzone.addEventListener(evtName, (e) => {
          e.preventDefault();
          dropzone.classList.add("border-sky-400", "bg-sky-950/20");
        });
      });
      ["dragleave", "drop"].forEach(evtName => {
        dropzone.addEventListener(evtName, (e) => {
          e.preventDefault();
          dropzone.classList.remove("border-sky-400", "bg-sky-950/20");
        });
      });
      dropzone.addEventListener("drop", (e) => {
        const file = e.dataTransfer?.files?.[0];
        if (!file) return;
        if (labelArchivo) labelArchivo.textContent = `Archivo arrastrado: ${file.name}`;
        const reader = new FileReader();
        reader.onload = (evt) => {
          const text = evt.target.result;
          if (textareaPegado) textareaPegado.value = text;
          analizarDatos(text);
        };
        reader.readAsText(file, "UTF-8");
      });
    }

    if (btnLimpiar) {
      btnLimpiar.addEventListener("click", () => {
        if (textareaPegado) textareaPegado.value = "";
        if (inputArchivo) inputArchivo.value = "";
        if (labelArchivo) labelArchivo.textContent = "Haz clic o arrastra tu archivo aquí";
        if (wrapperPreview) wrapperPreview.classList.add("hidden");
        this.masivoValidos = [];
      });
    }

    const analizarDatos = (rawText) => {
      if (!rawText || !rawText.trim()) {
        this.mostrarToast("Ingresa datos o sube un archivo.");
        return;
      }

      const cedulasExistentes = new Set(
        this.store.electores.map(e => (e.cedula || "").replace(/\D/g, "")).filter(Boolean)
      );

      const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) {
        this.mostrarToast("No se encontraron líneas de datos.");
        return;
      }

      const cedulasEnLote = new Set();
      const validos = [];
      let countDuplicados = 0;
      let countErrores = 0;
      const previewRows = [];

      lines.forEach((line, idx) => {
        let cols = [];
        if (line.includes("\t")) {
          cols = line.split("\t");
        } else if (line.includes(";")) {
          cols = line.split(";");
        } else {
          const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
          let match;
          const row = [];
          while ((match = regex.exec(line)) !== null && match.index < line.length) {
            let val = match[1] || "";
            if (val.startsWith('"') && val.endsWith('"')) {
              val = val.slice(1, -1).replace(/""/g, '"');
            }
            row.push(val.trim());
          }
          cols = row.length > 0 ? row : line.split(",");
        }

        cols = cols.map(c => (c || "").trim().replace(/^["']|["']$/g, ""));

        const lineStr = line.toLowerCase();
        if (idx === 0 && (lineStr.includes("cedula") || lineStr.includes("cédula") || lineStr.includes("nombre"))) {
          return;
        }

        if (cols.length === 0 || (cols.length === 1 && !cols[0])) return;

        let nombre = "";
        let rawCedula = "";
        let telefono = "";
        let voto = "duro";
        let edad = null;
        let profesion = "";
        let sector = "La Puente Sector 1 (Plaza)";
        let subParroquia = "Sub-Parroquia 6 • La Puente (Eje Central)";
        let centro = "Cruz Hernández Quijada";

        const col0SoloDigitos = cols[0].replace(/\D/g, "");
        const esCol0Cedula = /^(V|E|J)?[-.\s]?\d{5,9}$/i.test(cols[0]) || (col0SoloDigitos.length >= 6 && col0SoloDigitos.length <= 9 && !/[a-zA-Z\s]{4,}/.test(cols[0]));

        if (esCol0Cedula) {
          rawCedula = cols[0];
          nombre = cols[1] || "";
          telefono = cols[2] || "";
          if (cols[3]) {
            const v = cols[3].toLowerCase();
            if (v.includes("bland")) voto = "blando";
            else if (v.includes("nuev")) voto = "nuevo";
            else if (v.includes("dur")) voto = "duro";
            else if (/^\d+$/.test(cols[3])) edad = parseInt(cols[3]);
          }
          if (cols[4] && !edad && /^\d+$/.test(cols[4])) edad = parseInt(cols[4]);
          if (cols[5]) profesion = cols[5];
          if (cols[6]) sector = cols[6];
          if (cols[7]) subParroquia = cols[7];
          if (cols[8]) centro = cols[8];
        } else {
          nombre = cols[0] || "";
          rawCedula = cols[1] || "";
          telefono = cols[2] || "";
          if (cols[3]) {
            const v = cols[3].toLowerCase();
            if (v.includes("bland")) voto = "blando";
            else if (v.includes("nuev")) voto = "nuevo";
            else if (v.includes("dur")) voto = "duro";
          }
          if (cols[4] && /^\d+$/.test(cols[4])) edad = parseInt(cols[4]);
          if (cols[5]) profesion = cols[5];
          if (cols[6]) sector = cols[6];
          if (cols[7]) subParroquia = cols[7];
          if (cols[8]) centro = cols[8];
        }

        const digitos = rawCedula.replace(/\D/g, "");
        const tipoDoc = /E/i.test(rawCedula) ? "E" : "V";
        const cedulaFormateada = digitos ? `${tipoDoc}-${digitos}` : "";

        if (!nombre || nombre.length < 3 || !digitos || digitos.length < 5) {
          countErrores++;
          previewRows.push({
            status: "error",
            cedula: cedulaFormateada || rawCedula || "S/C",
            nombre: nombre || "Fila incompleta",
            sector: sector || "-",
            voto: voto
          });
          return;
        }

        if (cedulasExistentes.has(digitos) || cedulasEnLote.has(digitos)) {
          countDuplicados++;
          previewRows.push({
            status: "duplicado",
            cedula: cedulaFormateada,
            nombre: nombre,
            sector: sector || "-",
            voto: voto
          });
          return;
        }

        cedulasEnLote.add(digitos);
        const electorValido = {
          id: `god-masivo-${Date.now()}-${Math.floor(Math.random() * 10000)}-${idx}`,
          nombreApellido: nombre.toUpperCase(),
          cedula: cedulaFormateada,
          telefono: telefono || "",
          subParroquia: subParroquia,
          sector: sector,
          centroElectoral: centro,
          edad: edad || null,
          profesion: profesion || "",
          clasificacionVoto: voto,
          fechaRegistro: new Date().toISOString()
        };

        validos.push(electorValido);
        previewRows.push({
          status: "valido",
          cedula: cedulaFormateada,
          nombre: electorValido.nombreApellido,
          sector: electorValido.sector,
          voto: electorValido.clasificacionVoto
        });
      });

      this.masivoValidos = validos;

      const kpiValidos = document.getElementById("kpi-modal-validos");
      const kpiDuplicados = document.getElementById("kpi-modal-duplicados");
      const kpiInvalidos = document.getElementById("kpi-modal-invalidos");

      if (kpiValidos) kpiValidos.textContent = validos.length;
      if (kpiDuplicados) kpiDuplicados.textContent = countDuplicados;
      if (kpiInvalidos) kpiInvalidos.textContent = countErrores;

      if (wrapperPreview) wrapperPreview.classList.remove("hidden");

      if (tbodyPreview) {
        tbodyPreview.innerHTML = previewRows.slice(0, 50).map((r, i) => {
          let badgeClass = "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40";
          let badgeText = "Válido";
          if (r.status === "duplicado") {
            badgeClass = "bg-amber-950/60 text-amber-400 border border-amber-500/40";
            badgeText = "Duplicado";
          } else if (r.status === "error") {
            badgeClass = "bg-rose-950/60 text-rose-400 border border-rose-500/40";
            badgeText = "Inválido";
          }

          let votoBadge = "🟢 Duro";
          if (r.voto === "blando") votoBadge = "🟡 Blando";
          else if (r.voto === "nuevo") votoBadge = "🔵 Nuevo";

          return `
            <tr class="hover:bg-white/5 transition">
              <td class="p-2 text-center font-mono text-[10px] text-slate-400">${i + 1}</td>
              <td class="p-2 font-mono font-bold text-white whitespace-nowrap">${r.cedula}</td>
              <td class="p-2 font-semibold text-slate-200 truncate max-w-[140px]">${r.nombre}</td>
              <td class="p-2 text-[10px] text-slate-300 truncate max-w-[120px]">${r.sector}</td>
              <td class="p-2 text-center text-[10px] whitespace-nowrap">${votoBadge}</td>
              <td class="p-2 text-center text-[10px]">
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold ${badgeClass}">${badgeText}</span>
              </td>
            </tr>
          `;
        }).join("");
      }

      if (btnConfirmar && textConfirmar) {
        if (validos.length > 0) {
          btnConfirmar.disabled = false;
          btnConfirmar.classList.remove("opacity-50", "pointer-events-none");
          textConfirmar.textContent = `Inyectar ${validos.length} Electores`;
        } else {
          btnConfirmar.disabled = true;
          btnConfirmar.classList.add("opacity-50", "pointer-events-none");
          textConfirmar.textContent = `Sin electores válidos`;
        }
      }
    };

    if (btnAnalizar) {
      btnAnalizar.addEventListener("click", () => {
        const rawText = textareaPegado ? textareaPegado.value : "";
        analizarDatos(rawText);
      });
    }

    if (btnConfirmar) {
      btnConfirmar.addEventListener("click", () => {
        if (!this.masivoValidos || this.masivoValidos.length === 0) {
          this.mostrarToast("No hay electores válidos para importar.");
          return;
        }

        const resultado = this.store.importarElectores(this.masivoValidos);
        this.actualizarUI();
        this.mostrarToast(`✅ ${resultado.agregados} electores inyectados a la Central.`);
        cerrarModal();

        // Limpiar controles
        if (textareaPegado) textareaPegado.value = "";
        if (inputArchivo) inputArchivo.value = "";
        if (labelArchivo) labelArchivo.textContent = "Haz clic o arrastra tu archivo aquí";
        if (wrapperPreview) wrapperPreview.classList.add("hidden");
        this.masivoValidos = [];
      });
    }
  }

  mostrarToast(mensaje) {
    const toast = document.getElementById("voto-toast");
    const toastText = document.getElementById("voto-toast-text");
    if (!toast || !toastText) return;

    toastText.textContent = mensaje;
    toast.classList.remove("translate-y-20", "opacity-0");
    toast.classList.add("translate-y-0", "opacity-100");

    setTimeout(() => {
      toast.classList.remove("translate-y-0", "opacity-100");
      toast.classList.add("translate-y-20", "opacity-0");
    }, 3500);
  }
}

// Iniciar aplicación
document.addEventListener("DOMContentLoaded", () => {
  window.votoApp = new VotoApp();
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

window.addEventListener("load", () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
