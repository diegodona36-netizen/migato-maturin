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
