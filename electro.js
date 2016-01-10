// Objeto electro para el control del frigorifico

(function () {
	
	var sensores = { // Valores de los sensores
		tempExterior: 22,
		tempFrigorifico: 5,
		tempCongelador: 5,
		puertaFrigorifico: false,
		puertaCongelador: false,
		hora: new Date(),
		consumoFrigorifico: 0,
		consumoCongelador: 0,
	};
	
	var parametros = { // Valores de los parámetros
		motorFrigorifico: false,
		motorCongelador: false,
		alarma: false,
	};
	
	var manejadores = {}; // manejadores para el cambio de valores
		
	// Gestión del cambio de un dato
	function cambiar (dato, valor) {
		if (sensores[dato] !== undefined) {
			if (sensores[dato] == valor) return;
			sensores[dato] = valor;
		} else if (parametros[dato] !== undefined) {
			parametros[dato] = valor;
		} else {
			alert("ELECTRO. Error: No se puede cambiar: " + dato);
			return;
		}
		
		if (dato != "hora") console.log("ELECTRO: Cambiar:", dato, "valor:", valor);
		panel();
		if (manejadores[dato]) (manejadores[dato])(valor);
		
		if (dato == "motorFrigorifico" && valor) cambiar("consumoFrigorifico", sensores.consumoFrigorifico + 10);
		if (dato == "motorCongelador" && valor) cambiar("consumoCongelador", sensores.consumoCongelador + 10);
	}
	
	window.electroCambiar = cambiar; // para que el panel pueda cambiar sensores / parametros
	
	// Evolución de los sensores... Se invoca cada segundo
	function paso () {
		cambiar("hora", new Date());
		// Reajustes de consumo y temperatura
		for (var i = 0 ; i < 2 ; i ++) {
			var t = ["Frigorifico", "Congelador"][i];
			if (parametros["motor" + t]) { // Motor encendido
				cambiar("consumo" + t, sensores["consumo" + t] + 1); // Incrementar el consumo en 1W
				cambiar("temp" + t, sensores["temp" + t] -0.1); // Enfriar el interior 
			} else {
				// Ajustar temp en función de la temp ext y la puerta
				cambiar("temp" + t, sensores["temp" + t] + (sensores["puerta" + t] ? 0.05 : 0.001) * (sensores.tempExterior - sensores["temp" + t]));
			}
		}
		
		// Alarma ?
		if (parametros.alarma) beep();
	}
	
	// Actualiza el panel
	function panel () {
		var html = "";
		
		function c (etq, dato, valor) {
			return "<a style='text-decoration: none; background-color: rgba(0,0,0,0.25);' href='#' onClick='electroCambiar(\"" + dato + "\", " + valor + "); return false;'>" + etq + "</a>";
		}
		
		html += "<pre><strong>Electro - Panel</strong></pre>";
		html += "<pre> </pre>"
		html += "<pre>-- Sensores -- </pre>";
		html += "<pre><strong>Prta. Frg.:</strong> " + (sensores.puertaFrigorifico ? "Abierta" : "Cerrada") + " " + c("[/]", "puertaFrigorifico", ! sensores.puertaFrigorifico) + "</pre>";
		html += "<pre><strong>Prta. Cng.:</strong> " + (sensores.puertaCongelador ? "Abierta" : "Cerrada") + " " + c("[*]", "puertaCongelador", ! sensores.puertaCongelador) + "</pre>";
		html += "<pre><strong>Temp. Ext.:</strong> " + sensores.tempExterior.toFixed(2) + "&deg;C " + c("[-]", "tempExterior", sensores.tempExterior - 1) + " " + c("[+]", "tempExterior", sensores.tempExterior + 1) + "</pre>";
		html += "<pre><strong>Temp. Frg.:</strong> " + sensores.tempFrigorifico.toFixed(2) + "&deg;C</pre>";
		html += "<pre><strong>Temp. Cng.:</strong> " + sensores.tempCongelador.toFixed(2) + "&deg;C</pre>";
		html += "<pre><strong>Cons. Frg.:</strong> " + sensores.consumoFrigorifico + "W</pre>";
		html += "<pre><strong>Cons. Cng.:</strong> " + sensores.consumoCongelador + "W</pre>";
		html += "<pre> </pre>"
		html += "<pre>-- Par&aacute;metros -- </div>";
		html += "<pre><strong>Motor Frg.:</strong> " + (parametros.motorFrigorifico ? "Encendido" : "Apagado") + "</pre>";
		html += "<pre><strong>Motor Cng.:</strong> " + (parametros.motorCongelador ? "Encendido" : "Apagado") + "</pre>";
		html += "<pre><strong>    Alarma:</strong> " + (parametros.alarma ? "Encendida" : "Apagada") + "</pre>";
		
		document.getElementById("electro_panel").innerHTML = html;
	}

	// Opciones del panel
	var epVisible = false;
	var epH = 2;
	var epV = 0;
	
	// Aplica el estilo al panel en función de las opciones
	function estilo () {
		var ep = document.getElementById("electro_panel");
		ep.style.backgroundColor = "rgba(255,255,128,0.85)";
		ep.style.position = "fixed";
		ep.style.padding = "16px";
		ep.style.fontSize = "12px";
		ep.style.display = epVisible ? "block" : "none";
		ep.style.top = ["0", "25%", "auto"][epV];
		ep.style.bottom = ["auto", "auto", "0"][epV];
		ep.style.left = ["0", "25%", "auto"][epH];
		ep.style.right = ["auto", "auto", "0"][epH];
	}
	
	// Objeto de acceso a las funciones del electrodomestico
	window.electro = {};
	
	// Funciones de acceso para sensores: leer valor o establecer manejador
	for (var s in sensores) {
		(function (s) {
			window.electro[s] = function (v) {
				if (v === undefined) {
					return sensores[s];
				}
				if (typeof v === "function") {
					console.log("ELECTRO: Establecido manejador para sensor:", s);
					manejadores[s] = v;
					v(sensores[s]);
					return sensores[s];
				}
				
				alert("ELECTRO. Error: No se puede cambiar el valor de un sensor");
			};
		})(s);
	}
	
	// Funciones de acceso para parametros: leer valor, establecer valor o establecer manejador
	for (var p in parametros) {
		(function (p) {
			window.electro[p] = function (v) {
				if (v === undefined) return parametros[p]; // Leer
				if (typeof v === "function") { // Manejador
					console.log("ELECTRO: Establecido manejador para parametro:", p);
					manejadores[p] = v;
					v(parametros[p]);
					return parametros[p];
				}
				// Cambiar valor
				cambiar(p, v);
				return v;
			};
		})(p);
	}
	
	// Crear el panel
	document.getElementsByTagName("body")[0].innerHTML += "<code id='electro_panel'></code>";
	estilo();
	panel();
	
	// Botones de control del panel
	document.onkeyup = function (ev) {
		console.log(ev.which, ev);
		switch (ev.which) {
			case 111: cambiar("puertaFrigorifico", ! sensores.puertaFrigorifico); break;
			case 106: cambiar("puertaCongelador", ! sensores.puertaCongelador); break;
			case 107: cambiar("tempExterior", sensores.tempExterior + 1); break;
			case 109: cambiar("tempExterior", sensores.tempExterior - 1); break;
			case 96: epVisible = ! epVisible; estilo(); break; // 0 - mostrar / ocultar panel
			// 0-9 posicionar panel
			case 97:  epVisible = true; epH = 0, epV = 2; estilo(); break;
			case 98:  epVisible = true; epH = 1, epV = 2; estilo(); break;
			case 99:  epVisible = true; epH = 2, epV = 2; estilo(); break;
			case 100: epVisible = true; epH = 0, epV = 1; estilo(); break;
			case 101: epVisible = true; epH = 1, epV = 1; estilo(); break;
			case 102: epVisible = true; epH = 2, epV = 1; estilo(); break;
			case 103: epVisible = true; epH = 0, epV = 0; estilo(); break;
			case 104: epVisible = true; epH = 1, epV = 0; estilo(); break;
			case 105: epVisible = true; epH = 2, epV = 0; estilo(); break;
			default: return;
		}
		
		return false;
	};

	setInterval(paso, 1000); // Inicio la ejecución

	// Sonido de un pitido
	var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
	
	// Reproduce un pitido
	function beep() {
		snd.play();
	}
	
})();