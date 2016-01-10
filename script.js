// Frigorifico
		var tFrigoConf;
		function cambiarTFrigoConf (temp) {
			tFrigoConf = temp;
			document.getElementById("tempFrigoConf").innerHTML = temp + " &deg;C";
		}
		cambiarTFrigoConf(2);

		function cambioTFrigoInterior (temp) {
			document.getElementById("tempFrigoInterior").innerHTML = temp.toFixed(2) + " &deg;C"
		}
		electro.tempFrigorifico(cambioTFrigoInterior);

		function cambioPuertaFrigo (estado) {
			document.getElementById("puertaFrigo").innerHTML = estado ? "Abierta" : "Cerrada";
			ajustarMotores();
		}
		electro.puertaFrigorifico(cambioPuertaFrigo);

		function cambioMotorFrigo (estado) {
			document.getElementById("motorFrigo").innerHTML = estado ? "Encendido" : "Apagado";
		}
		electro.motorFrigorifico(cambioMotorFrigo);

		function cambioConsumoFrigo (watios) {
			document.getElementById("consumoFrigo").innerHTML = watios + " W";
			document.getElementById("consumo").innerHTML = watios + electro.consumoCongelador() + " W";
		}
		electro.consumoFrigorifico(cambioConsumoFrigo);

		// Congelador
		var tCongConf;
		function cambiarTCongConf (temp) {
			tCongConf = temp;
			document.getElementById("tempCongConf").innerHTML = temp + " &deg;C";
		}
		cambiarTCongConf(-5);

		function cambioTCongInterior (temp) {
			document.getElementById("tempCongInterior").innerHTML = temp.toFixed(2) + " &deg;C"
		}
		electro.tempCongelador(cambioTCongInterior);

		function cambioPuertaCong (estado) {
			document.getElementById("puertaCong").innerHTML = estado ? "Abierta" : "Cerrada";
			ajustarMotores();
		}
		electro.puertaCongelador(cambioPuertaCong);

		function cambioMotorCong (estado) {
			document.getElementById("motorCong").innerHTML = estado ? "Encendido" : "Apagado";
		}
		electro.motorCongelador(cambioMotorCong);

		function cambioConsumoCong (watios) {
			document.getElementById("consumoCong").innerHTML = watios + " W";
			document.getElementById("consumo").innerHTML = watios + electro.consumoFrigorifico() + " W";
		}
		electro.consumoCongelador(cambioConsumoCong);

		// General
		var encendido;
		function cambiarEncendido (estado) {
			encendido = estado;
			document.getElementById("encendido").innerHTML = estado ? "Encendido" : "Apagado";
			document.getElementById("encender").innerHTML = estado ? "Agagar" : "Encender";
			if (encendido) {
				ajustarMotores();
			} else {
				electro.motorFrigorifico(false);
				electro.motorCongelador(false);
			}
		}
		cambiarEncendido(false);


		function cambioTExterior (temp) {
			document.getElementById("tempExterior").innerHTML = temp.toFixed(2) + " &deg;C"
		}
		electro.tempExterior(cambioTExterior);

		function cambioAlarma (estado) {
			document.getElementById("alarma").innerHTML = estado ? "Encendido" : "Apagado";
		}
		electro.alarma(cambioAlarma);
		
		var valores = [];
		var nValores = 100;
		var n = 0;
		function estadisticas () {
			valores[n % nValores] = {
				te: electro.tempExterior(),
				tf: electro.tempFrigorifico(),
				tc: electro.tempCongelador(),
				cf: tFrigoConf,
				cc: tCongConf,
				wf: electro.consumoFrigorifico(),
				wc: electro.consumoCongelador(),
				mf: (electro.consumoFrigorifico() - (n > 60 ? valores[(n - 60) % nValores].wf : 0)) / Math.min(n + 1, 60) * 10, 
				mc: (electro.consumoCongelador() - (n > 60 ? valores[(n - 60) % nValores].wc : 0)) / Math.min(n + 1, 60) * 10, 
			};
			
			console.log(n, valores[n % nValores]);
			n ++;
			
			var canvas = document.getElementById("grafico");
			var w = canvas.width, h = canvas.height;
			var cntx = canvas.getContext("2d");
			var x, i, ini = Math.max(0, n - nValores);
			var tMin = -15, tMax = 45;
			var eH = w / nValores, eV = h / (tMax - tMin);

			cntx.clearRect(0, 0, w, h);
						
			// Lineas de marcas
			for (var k = tMin + 5 ; k < tMax ; k += 10) {
				cntx.beginPath();
				cntx.moveTo(0, h + (tMin - k) * eV);
				cntx.lineTo(w, h + (tMin - k) * eV)
				cntx.strokeStyle = "#aaa";
				cntx.lineWidth = 1;
				cntx.stroke();
				cntx.fillText(k + " ºC", 0, h + (tMin - k) * eV);
				cntx.fillText((k / 10) + " W", w - 25, h + (tMin - k) * eV);
			}
			
			// Medidas
			var prop = ["te", "tf", "tc", "cf", "cc", "mf", "mc"];
			var color = ["#f00", "#4a4", "#44a", "#0a0", "#00a", "#aa0", "#a0a"];
			for (var k = 0 ; k < prop.length ; k ++) {
				cntx.beginPath();
				for (x = 0, i = ini ; i < n ; i ++, x += eH) {
					y = h + (tMin - valores[i % nValores][prop[k]]) * eV;
					if (x) {
						cntx.lineTo(x, y);
					} else {
						cntx.moveTo(0, y)
					}
				}
				cntx.lineWidth = 2;
				cntx.strokeStyle = color[k],
				cntx.stroke();
			}
		}

		function cambioHora (hora) {
			document.getElementById("hora").innerHTML = hora.getHours() + ":" + hora.getMinutes() + ":" + hora.getSeconds();
			
			ajustarMotores();
			estadisticas();
		}
		electro.hora(cambioHora);

		function ajustarMotores () {
			if (encendido) {
				if (! electro.motorFrigorifico() && ! electro.puertaFrigorifico() && electro.tempFrigorifico() > tFrigoConf) electro.motorFrigorifico(true);
				if (electro.motorFrigorifico() && (electro.puertaFrigorifico() || electro.tempFrigorifico() < tFrigoConf)) electro.motorFrigorifico(false);

				if (! electro.motorCongelador() && ! electro.puertaCongelador() && electro.tempCongelador() > tCongConf) electro.motorCongelador(true);
				if (electro.motorCongelador() && (electro.puertaCongelador() || electro.tempCongelador() < tCongConf)) electro.motorCongelador(false);
			}
		}