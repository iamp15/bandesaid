import { convertPesoGuiaSADA, formatPesoAplicacion } from "./convertPesoGuiaSADA";

/**
 * Busca un elemento que contenga un texto específico
 * @param {Document} doc - Documento HTML parseado
 * @param {string} tagName - Nombre de la etiqueta (ej: 'td', 'div')
 * @param {string} searchText - Texto a buscar
 * @returns {Element|null} - Elemento encontrado o null
 */
const findElementByText = (doc, tagName, searchText) => {
  const elements = doc.querySelectorAll(tagName);
  for (const element of elements) {
    if (element.textContent && element.textContent.includes(searchText)) {
      return element;
    }
  }
  return null;
};

/**
 * Procesa HTML manualmente pegado por el usuario para extraer datos de la guía SADA
 * @param {string} html - HTML de la guía SADA
 * @returns {Object} - Objeto con los datos extraídos
 */
export const processHtmlManually = (html) => {
  if (!html || typeof html !== "string" || html.trim().length === 0) {
    throw new Error("HTML vacío o inválido");
  }

  try {
    // Crear un parser de HTML usando DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Extraer número de guía
    const numeroGuia = extractNumeroGuia(doc);

    // Extraer fecha (del texto "aprobado por el sistema el xx-xx-xxxx")
    const fecha = extractFecha(doc);

    // Extraer conductor (nombre y cédula)
    const conductorData = extractConductor(doc);

    // Extraer placa del vehículo
    const placa = extractPlaca(doc);

    // Extraer empresa destino (código, razón social, estado)
    const empresaDestino = extractEmpresaDestino(doc);

    // Extraer cantidad de rubros en TM
    const cantidadRubrosTM = extractCantidadRubros(doc);

    // Convertir TM a Kg
    const cantidadRubros = convertPesoGuiaSADA(cantidadRubrosTM);
    const cantidadRubrosFormateado = formatPesoAplicacion(cantidadRubros);

    return {
      numeroGuia,
      fecha,
      conductor: conductorData.nombre || "",
      conductorCedula: conductorData.cedula || "",
      placa,
      empresaDestino,
      cantidadRubros,
      cantidadRubrosFormateado,
    };
  } catch (error) {
    throw new Error(`Error al procesar el HTML: ${error.message}`);
  }
};

/**
 * Extrae el número de guía del HTML
 */
const extractNumeroGuia = (doc) => {
  // Buscar en la estructura real: <strong>N GUÍA:</strong> 169237228
  const tdNumero = findElementByText(doc, 'td', 'N GUÍA');
  if (tdNumero) {
    const row = tdNumero.closest('tr');
    if (row) {
      const cells = row.querySelectorAll('td');
      for (const cell of cells) {
        const text = cell.textContent || "";
        // Buscar número de guía después de "N GUÍA:"
        const match = text.match(/N\s*GUÍA[:\s]*(\d+)/i);
        if (match) return match[1].trim();
        // O buscar solo números en esa celda
        const numMatch = text.match(/(\d{6,})/);
        if (numMatch && !text.includes('GUÍA')) return numMatch[1].trim();
      }
    }
  }

  // Buscar en texto de la página
  const textContent = doc.body.textContent || "";
  const guiaMatch = textContent.match(/N\s*GUÍA[:\s]*(\d+)/i);
  if (guiaMatch) {
    return guiaMatch[1].trim();
  }

  // Buscar en input fields
  const selectors = [
    'input[name*="guia"]',
    'input[name*="numero"]',
    '[id*="guia"]',
    '[id*="numero"]',
  ];

  for (const selector of selectors) {
    const element = doc.querySelector(selector);
    if (element) {
      const value = element.value || element.textContent || "";
      if (value.trim()) return value.trim();
    }
  }

  return "";
};

/**
 * Extrae la fecha del texto "aprobado por el sistema el xx-xx-xxxx"
 */
const extractFecha = (doc) => {
  const textContent = doc.body.textContent || "";
  // Buscar patrón: "APROBADO POR SISTEMA EL 26-01-2026 03:12:53 PM"
  const fechaMatch = textContent.match(
    /APROBADO\s+POR\s+SISTEMA\s+EL\s+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i
  );

  if (fechaMatch) {
    return fechaMatch[1];
  }

  // Buscar patrón alternativo: "aprobado por el sistema el DD-MM-YYYY"
  const fechaMatch2 = textContent.match(
    /aprobado\s+por\s+el\s+sistema\s+el\s+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i
  );

  if (fechaMatch2) {
    return fechaMatch2[1];
  }

  // Buscar otras variaciones de fecha
  const fechaMatch3 = textContent.match(/(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/);
  if (fechaMatch3) {
    return fechaMatch3[1];
  }

  return "";
};

/**
 * Extrae el nombre y cédula del conductor
 * @returns {Object} - {nombre: string, cedula: string}
 */
const extractConductor = (doc) => {
  const result = { nombre: "", cedula: "" };
  
  // Buscar en la estructura real: <strong>CONDUCTOR:</strong> [14667801] - LEONARDO NICOLAS ASCENSO GUEVARA
  const tdConductor = findElementByText(doc, 'td', 'CONDUCTOR');
  if (tdConductor) {
    const row = tdConductor.closest('tr');
    if (row) {
      const cells = row.querySelectorAll('td');
      for (const cell of cells) {
        const text = (cell.textContent || "").trim();
        // Buscar el formato: [número] - NOMBRE
        const match = text.match(/\[(\d+)\]\s*-\s*(.+)/);
        if (match) {
          result.cedula = match[1].trim();
          result.nombre = match[2].trim();
          return result;
        }
        // Si no tiene el formato completo, intentar extraer por separado
        if (text && !text.match(/^CONDUCTOR/i) && text.length > 5) {
          const cedulaMatch = text.match(/\[(\d+)\]/);
          if (cedulaMatch) {
            result.cedula = cedulaMatch[1].trim();
          }
          const nombreMatch = text.replace(/\[.*?\]\s*-\s*/, '').trim();
          if (nombreMatch && nombreMatch.length > 3) {
            result.nombre = nombreMatch;
          }
          if (result.nombre || result.cedula) {
            return result;
          }
        }
      }
    }
  }

  // Buscar en texto general
  const textContent = doc.body.textContent || "";
  const conductorMatch = textContent.match(
    /CONDUCTOR[:\s]+\[(\d+)\]\s*-\s*([A-ZÁÉÍÓÚÑ\s]+)/i
  );
  if (conductorMatch) {
    result.cedula = conductorMatch[1].trim();
    result.nombre = conductorMatch[2].trim();
    return result;
  }

  // Buscar en input fields
  const selectors = [
    'input[name*="conductor"]',
    'input[name*="chofer"]',
    '[id*="conductor"]',
    '[id*="chofer"]',
  ];

  for (const selector of selectors) {
    const element = doc.querySelector(selector);
    if (element) {
      const value = element.value || element.textContent || "";
      if (value.trim()) {
        result.nombre = value.trim();
        return result;
      }
    }
  }

  return result;
};

/**
 * Extrae la placa del vehículo
 */
const extractPlaca = (doc) => {
  // Buscar en la estructura real: <strong>VEHÍCULO:</strong> CAMION - A15AU8E -
  const tdVehiculo = findElementByText(doc, 'td', 'VEHÍCULO');
  if (tdVehiculo) {
    const row = tdVehiculo.closest('tr');
    if (row) {
      const cells = row.querySelectorAll('td');
      for (const cell of cells) {
        const text = (cell.textContent || "").trim();
        // Buscar patrón: TIPO - PLACA - (ej: "CAMION - A15AU8E -")
        const placaMatch = text.match(/-\s*([A-Z0-9]{6,8})\s*-/i);
        if (placaMatch) {
          return placaMatch[1].toUpperCase().trim();
        }
        // Buscar solo la placa si no tiene el formato completo
        const placaMatch2 = text.match(/([A-Z]{1,3}\d{1,3}[A-Z0-9]{0,2})/i);
        if (placaMatch2 && !text.match(/^VEHÍCULO/i) && text.length < 50) {
          return placaMatch2[1].toUpperCase().trim();
        }
      }
    }
  }

  // Buscar en input fields
  const selectors = [
    'input[name*="placa"]',
    '[id*="placa"]',
  ];

  for (const selector of selectors) {
    const element = doc.querySelector(selector);
    if (element) {
      const value = element.value || element.textContent || "";
      if (value.trim()) return value.trim().toUpperCase();
    }
  }

  // Buscar patrón de placa venezolana en texto
  const textContent = doc.body.textContent || "";
  const placaMatch = textContent.match(
    /VEHÍCULO[:\s]+.*?-\s*([A-Z0-9]{6,8})\s*-/i
  );
  if (placaMatch) {
    return placaMatch[1].toUpperCase().trim();
  }

  return "";
};

/**
 * Extrae información de la empresa destino (código, razón social, estado)
 */
const extractEmpresaDestino = (doc) => {
  const empresaDestino = {
    codigo: "",
    razonSocial: "",
    estado: "",
  };

  // Buscar la sección de EMPRESA DESTINO (debe estar en la segunda col-5, no en la primera)
  const empresaDestinoSection = findElementByText(doc, 'div', 'EMPRESA DESTINO');
  if (empresaDestinoSection) {
    // Buscar el contenedor col-5 que contiene EMPRESA DESTINO (no EMPRESA ORIGEN)
    const colContainer = empresaDestinoSection.closest('.col-5');
    
    if (colContainer) {
      // Verificar que este contenedor realmente contiene "EMPRESA DESTINO" y no "EMPRESA ORIGEN"
      const sectionText = colContainer.textContent || "";
      if (sectionText.includes('EMPRESA DESTINO') && !sectionText.includes('EMPRESA ORIGEN')) {
        const table = colContainer.querySelector('table');
        
        if (table) {
          const rows = table.querySelectorAll('tr');
          for (const row of rows) {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 2) {
              const label = (cells[0].textContent || "").trim();
              const value = (cells[1].textContent || "").trim();
              
              if (label.includes('CÓDIGO') && !empresaDestino.codigo) {
                empresaDestino.codigo = value;
              } else if (label.includes('RAZÓN') && !empresaDestino.razonSocial) {
                empresaDestino.razonSocial = value;
              } else if (label.includes('ESTADO') && !empresaDestino.estado) {
                empresaDestino.estado = value;
              }
            }
          }
        }
      }
    }
  }
  
  // Si no se encontró, buscar todas las secciones col-5 y encontrar la que tiene EMPRESA DESTINO
  if (!empresaDestino.codigo && !empresaDestino.razonSocial) {
    const allCols = doc.querySelectorAll('.col-5');
    for (const col of allCols) {
      const colText = col.textContent || "";
      // Verificar que contiene EMPRESA DESTINO pero no EMPRESA ORIGEN
      if (colText.includes('EMPRESA DESTINO') && !colText.includes('EMPRESA ORIGEN')) {
        const table = col.querySelector('table');
        if (table) {
          const rows = table.querySelectorAll('tr');
          for (const row of rows) {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 2) {
              const label = (cells[0].textContent || "").trim();
              const value = (cells[1].textContent || "").trim();
              
              if (label.includes('CÓDIGO') && !empresaDestino.codigo) {
                empresaDestino.codigo = value;
              } else if (label.includes('RAZÓN') && !empresaDestino.razonSocial) {
                empresaDestino.razonSocial = value;
              } else if (label.includes('ESTADO') && !empresaDestino.estado) {
                empresaDestino.estado = value;
              }
            }
          }
        }
        break; // Solo procesar la primera columna que tenga EMPRESA DESTINO
      }
    }
  }

  // Si aún no se encontró, buscar directamente en td pero solo en la sección de destino
  // Buscar todos los td con "CÓDIGO" y verificar que están en la sección de destino
  if (!empresaDestino.codigo) {
    const allTdCodigo = doc.querySelectorAll('td');
    for (const td of allTdCodigo) {
      const text = (td.textContent || "").trim();
      if (text === 'CÓDIGO') {
        // Verificar que está en la sección de destino, no en origen
        const colContainer = td.closest('.col-5');
        if (colContainer) {
          const colText = colContainer.textContent || "";
          if (colText.includes('EMPRESA DESTINO') && !colText.includes('EMPRESA ORIGEN')) {
            const row = td.closest('tr');
            if (row) {
              const cells = row.querySelectorAll('td');
              for (const cell of cells) {
                const cellText = (cell.textContent || "").trim();
                if (cellText && cellText !== 'CÓDIGO' && cellText.match(/^\d+$/)) {
                  empresaDestino.codigo = cellText;
                  break;
                }
              }
            }
            if (empresaDestino.codigo) break;
          }
        }
      }
    }
  }

  if (!empresaDestino.razonSocial) {
    const allTdRazon = doc.querySelectorAll('td');
    for (const td of allTdRazon) {
      const text = (td.textContent || "").trim();
      if (text === 'RAZÓN') {
        const colContainer = td.closest('.col-5');
        if (colContainer) {
          const colText = colContainer.textContent || "";
          if (colText.includes('EMPRESA DESTINO') && !colText.includes('EMPRESA ORIGEN')) {
            const row = td.closest('tr');
            if (row) {
              const cells = row.querySelectorAll('td');
              for (const cell of cells) {
                const cellText = (cell.textContent || "").trim();
                if (cellText && cellText !== 'RAZÓN' && cellText.length > 3) {
                  empresaDestino.razonSocial = cellText;
                  break;
                }
              }
            }
            if (empresaDestino.razonSocial) break;
          }
        }
      }
    }
  }

  if (!empresaDestino.estado) {
    const allTdEstado = doc.querySelectorAll('td');
    for (const td of allTdEstado) {
      const text = (td.textContent || "").trim();
      if (text === 'ESTADO') {
        const colContainer = td.closest('.col-5');
        if (colContainer) {
          const colText = colContainer.textContent || "";
          if (colText.includes('EMPRESA DESTINO') && !colText.includes('EMPRESA ORIGEN')) {
            const row = td.closest('tr');
            if (row) {
              const cells = row.querySelectorAll('td');
              for (const cell of cells) {
                const cellText = (cell.textContent || "").trim();
                if (cellText && cellText !== 'ESTADO' && cellText.length > 2) {
                  empresaDestino.estado = cellText;
                  break;
                }
              }
            }
            if (empresaDestino.estado) break;
          }
        }
      }
    }
  }

  // Fallback: buscar en input fields
  const selectors = {
    codigo: ['input[name*="codigo"]', 'input[name*="espejo"]', '[id*="codigo"]'],
    razonSocial: ['input[name*="razon"]', 'input[name*="destino"]', '[id*="razon"]'],
    estado: ['input[name*="estado"]', '[id*="estado"]'],
  };

  if (!empresaDestino.codigo) {
    for (const selector of selectors.codigo) {
      const element = doc.querySelector(selector);
      if (element) {
        const value = element.value || element.textContent || "";
        if (value.trim()) {
          empresaDestino.codigo = value.trim();
          break;
        }
      }
    }
  }

  if (!empresaDestino.razonSocial) {
    for (const selector of selectors.razonSocial) {
      const element = doc.querySelector(selector);
      if (element) {
        const value = element.value || element.textContent || "";
        if (value.trim()) {
          empresaDestino.razonSocial = value.trim();
          break;
        }
      }
    }
  }

  if (!empresaDestino.estado) {
    for (const selector of selectors.estado) {
      const element = doc.querySelector(selector);
      if (element) {
        const value = element.value || element.textContent || "";
        if (value.trim()) {
          empresaDestino.estado = value.trim();
          break;
        }
      }
    }
  }

  return empresaDestino;
};

/**
 * Extrae la cantidad de rubros en TM
 */
const extractCantidadRubros = (doc) => {
  // Buscar en la tabla de RUBROS, columna CANTIDAD
  // Estructura: <td class="text-center">11,200 TM</td>
  const rubrosSection = findElementByText(doc, 'div', 'RUBROS');
  if (rubrosSection) {
    const table = rubrosSection.parentElement?.querySelector('table') ||
                  rubrosSection.nextElementSibling?.querySelector('table');
    
    if (table) {
      const rows = table.querySelectorAll('tbody tr');
      for (const row of rows) {
        const cells = row.querySelectorAll('td');
        // La columna CANTIDAD es generalmente la segunda (índice 1)
        if (cells.length > 1) {
          const cantidadCell = cells[1]; // Segunda columna
          const text = (cantidadCell.textContent || "").trim();
          // Buscar formato: "11,200 TM" o "11,200"
          const tmMatch = text.match(/(\d+,\d{3})/);
          if (tmMatch) {
            return tmMatch[1];
          }
        }
      }
    }
  }

  // Buscar directamente en td que contenga el formato TM
  const allTds = doc.querySelectorAll('td');
  for (const td of allTds) {
    const text = td.textContent || "";
    // Buscar formato: "11,200 TM"
    const tmMatch = text.match(/(\d+,\d{3})\s*TM/i);
    if (tmMatch) {
      return tmMatch[1];
    }
  }

  // Buscar en input fields
  const selectors = [
    'input[name*="rubro"]',
    'input[name*="peso"]',
    'input[name*="cantidad"]',
    '[id*="rubro"]',
    '[id*="peso"]',
  ];

  for (const selector of selectors) {
    const element = doc.querySelector(selector);
    if (element) {
      const value = element.value || element.textContent || "";
      const tmMatch = value.match(/(\d+,\d{3})/);
      if (tmMatch) {
        return tmMatch[1];
      }
    }
  }

  // Buscar en texto general
  const textContent = doc.body.textContent || "";
  const tmMatch = textContent.match(/(\d+,\d{3})\s*TM/i);
  if (tmMatch) {
    return tmMatch[1];
  }

  return "";
};
