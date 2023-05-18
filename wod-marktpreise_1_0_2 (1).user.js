// ==UserScript==
// @name        WoD-VG Marktpreise
// @namespace   wod
// @description VG können nach vorgeschlagenen Marktpreisen-FP-Abschlag von Marktpreisen-Preis pro AW etc eingestellt werden
// @grant       none
// @require     https://gist.githubusercontent.com/arantius/3123124/raw/grant-none-shim.js
// @include     http*://*.world-of-dungeons.de/wod/spiel/hero/items.php*
// ==/UserScript==

// *************************************************************
// *** WoD-Marktpreise						                 ***
// *** Dieses Script ist Freeware                            ***
// *** Wer es verbessern will, moege dies tun, aber bitte    ***
// *** nicht meinen Namen entfernen.                         ***
// *** Danke! Christian Räuschel                             ***
// *** Erweitert von Oliver Brück aka Tintenherz			 ***
// *************************************************************

var version = "1.0.3";
stand = "08.08.2019";

configBereichErzeugen();

//#################
// Config bereich
//#################
function configBereichErzeugen ()
{
	var hinweisBereich = document.getElementById('cbtcfg_div_1');
	//alert(hinweisBereich);
	welt = window.location.host.split('.')[0];
	//alert(welt);
	
	//#############
	//Div erstellen
	var div = document.createElement("div");
	div.id = "configBereich";
	div.style.display = "none";
	
	//#############
	// Aus/Einblend Button erzeugen
	var einAus = document.createElement("a");
	einAus.id = "einaus";
	einAus.text = "VG Konfig Ein/ausblenden";
	einAus.className ="button_minor";
	einAus.style.fontSize = "20px";
	einAus.addEventListener('click', function () { KonfigBereichSichtbarkeit(); } , false);
	
	//#############
	//Suche VG aus den angezeigten Items
	VGListe = sucheVG();
	
	var tabelle = document.createElement("table");
	tabelle.id = "configTabelle";
	//alert(VGListe.length);
	
	for (i=0; i < VGListe.length;i++)
	{
		var tr = document.createElement("tr");
		
	//++++++++++++++++
	//Verbrauchsgutbezeichnung
		var typename = "item";
		var td = document.createElement("td");
		td.id = "VG"+i;
		td.className = VGListe[i];
	//	td.innerHTML = VGListe[i];
		
		var button = document.createElement("a");
		//button.setAttribute('style','border-color:white;border-width:1px;border-style:solid;');
		button.text = VGListe[i];
		button.href = "http://"+ welt + ".world-of-dungeons.de/wod/spiel/hero/item.php?name=" + VGListe[i] + "&jump=1/wod/spiel/hero/item.php?name=" + VGListe[i] + "&jump=1&IS_POPUP=1";
		button.target = "_blank";
		td.appendChild(button);

	//+++++++++++++++
	//Optionen Auswahl
		var td2 = document.createElement("td");
		var select = document.createElement("select");
		select.id = "select_VG"+i;
		
		var opt0 = new Option("Nicht handeln", "0");
		var opt1 = new Option("Vorschlagspreis", "1");
		var opt2 = new Option("Preis pro AW", "2");
		var opt3 = new Option("Abschlag vom Vorschlagspreis", "3");
		var opt4 = new Option("Festpreis", "4");
		
		select.options[0] = opt0;
		select.options[1] = opt1;
		select.options[2] = opt2;
		select.options[3] = opt3;
		select.options[4] = opt4;
		select.onchange = function () {
			configAuswahlChange(this);
		}


	//+++++++++++++++
	//Wert
		var td3 = document.createElement("td");
		var input = document.createElement("input");
		input.id = "wert_VG"+i;
		input.innerHTML = VGListe[i];
		input.style.visibility = 'hidden';

		tabelle.appendChild(tr);
		td2.appendChild(select);
		td3.appendChild(input);
		
		tabelle.appendChild(td);
		tabelle.appendChild(td2);
		tabelle.appendChild(td3);
		
		var speicherOption = GM_getValue(welt + "_VG_" + VGListe[i], "");

		alert("+++" + speicherOption + "-+++");
		if (speicherOption != "")
		{
			var auswahl = speicherOption.split("+++")[0];
			var wert = speicherOption.split("+++")[1];
			select.options[auswahl].selected = true;
			
		//++++++++++++++++++++++
		//Wenn Preis pro AW oder Abschlag ausgewählt ist blende das Wertefeld ein
			if (auswahl == 2 || auswahl == 3 || auswahl == 4) {
				input.style.visibility = 'visible';
			}
			
			input.value = wert;
			//alert("Input: " + wert);
		}
		
	}
	
	var speicherButton = document.createElement("input");
	speicherButton.type = "button";
	speicherButton.name = "speichern";
	speicherButton.value = "Speichern";
	speicherButton.className = "button";
	speicherButton.addEventListener('click', function () { preise_speichern(); } , false);


	div.appendChild(tabelle);
	div.appendChild(speicherButton);
	hinweisBereich.parentNode.appendChild(einAus);
	hinweisBereich.parentNode.appendChild(div);
}

//++++++++++++++++++
//Sichtbarkeit des Konfigbereichs ändern
//++++++++++++++++++
function KonfigBereichSichtbarkeit ()
{
	var divStatus = document.getElementById("configBereich");
	if (divStatus.style.display == "none")
	{
		divStatus.style.display = "inline";
	} else {
		divStatus.style.display = "none";
	}
}

//++++++++++++++++++
//Preise sichern
//++++++++++++++++++
function preise_speichern()
{
	for(i=0;i<VGListe.length;i++)
	{
		var select = document.getElementById("select_VG" + [i]);
		var wert = document.getElementById("wert_VG" + [i]);
		//alert("select: " + select.selectedIndex + "+++ Wert: " + wert.value);
		GM_setValue(welt + "_VG_" + VGListe[i], select.selectedIndex + "+++" + wert.value);
	}
}


//###################
//Ermittle die VG die angezeigt werden
//###################
function sucheVG ()
{
	VG = new Array();
	var allSelects = document.getElementsByTagName('option');
	
	for (var i = 0; i < allSelects.length; i++)
	{
		var gefunden = 0;
		
		var thisSelect = allSelects[i];	
		if ((thisSelect.value == "go_group_2") || (thisSelect.value == "-go_group_2"))
		{
			var Zeile = thisSelect.parentNode.parentNode.parentNode;
			var itemName = Zeile.getElementsByTagName('a');
			
			if (itemName.length != 0) 
			{
			
//++++++++++++
//Prüfe ob es ein VG ist
				if (itemName[0].parentNode.innerHTML.match(/\)$/))
				{
					for (b=0;b<VG.length;b++)
					{
					
				//#######################
				//Entferne ! aus dem Text
						var iname = itemName[0].text.replace("!","")
						if (iname == VG[b]) 
						{
							var gefunden = 1;
							break;
						}
					}
				
				//++++++++++++++++++
				//Wenn Item noch nicht in VG hinterlegt füge es hinzu
					if (gefunden == 0)
					{
						VG.push(itemName[0].text.replace("!",""));
					}
				}
			}
		}
	}
	return VG;
}


//++++++++++++++++++++++++++
// Event: Wert ändert sich in Konfig Selection Box 
//++++++++++++++++++++++++++

function configAuswahlChange (knode)
{
	//alert(knode.selectedIndex);
	switch (knode.selectedIndex) {
		case 0:
		//+++++++
		//"Nicht handeln" ist ausgewählt
		//Textfeld ausblenden
			var zeilenNr = knode.id.substr(9,knode.id.length);
			//alert("Zeilennummer: " + zeilenNr);
			var textfeld = "wert_VG" + zeilenNr;
			var knodeTextfeld = document.getElementById(textfeld);
			knodeTextfeld.value = "";
			knodeTextfeld.style.visibility = 'hidden';
			break;
		case 1:
		//+++++++
		//"Vorschlagspreis" ist ausgewählt
		//Textfeld ausblenden
			var zeilenNr = knode.id.substr(9,knode.id.length);
			//alert("Zeilennummer: " + zeilenNr);
			var textfeld = "wert_VG" + zeilenNr;
			var knodeTextfeld = document.getElementById(textfeld);
			knodeTextfeld.style.visibility = 'hidden';
			break;
		case 2:
		//+++++++
		//"Preis pro AW" ist ausgewählt
		//Textfeld eingeblendet
			var zeilenNr = knode.id.substr(9,knode.id.length);
			//alert("Zeilennummer: " + zeilenNr);
			var textfeld = "wert_VG" + zeilenNr;
			var knodeTextfeld = document.getElementById(textfeld);
			knodeTextfeld.style.visibility = 'visible';
			break;
		case 3:
		//+++++++
		//Abschlag vom Vorschlagspreis
		//Textfeld eingeblendet
			var zeilenNr = knode.id.substr(9,knode.id.length);
			//alert("Zeilennummer: " + zeilenNr);
			var textfeld = "wert_VG" + zeilenNr;
			var knodeTextfeld = document.getElementById(textfeld);
			knodeTextfeld.style.visibility = 'visible';
			break;
		case 4:		
		//+++++++
		//Abschlag vom Vorschlagspreis
		//Textfeld eingeblendet
			var zeilenNr = knode.id.substr(9,knode.id.length);
			//alert("Zeilennummer: " + zeilenNr);
			var textfeld = "wert_VG" + zeilenNr;
			var knodeTextfeld = document.getElementById(textfeld);
			knodeTextfeld.style.visibility = 'visible';
			break;
	}
}



// button_einfuegen(createButton(), tabellenNr());
//	alert("2");


function tabellenNr()
{
	var tabNr;
	var tabellen = document.getElementsByTagName("table");
	var anztabellen =  document.getElementsByTagName("table").length;
	for (tabNr=0; tabNr<anztabellen; tabNr++)
	{
		if (tabellen[tabNr].className == "content_table")
		{
			break;
		}
	} 
	return tabNr;
}

function preise_eintragen(tabNr)
{
	//alert(tabNr);
	var tab = document.getElementsByClassName('content_table');
	//alert("tab: " + tab.length);
	//var tabellen = document.getElementsByTagName("table");
	var r = tab[0].getElementsByTagName("tr");
	//alert("r: " + r.length);
	for (var j=2; j<r.length; j++)
	{
		var d = r[j].getElementsByTagName("td");
				//alert("r: " + r[1].innerHTML + "+++" + j);
		//alert(d[4].innerHTML);
		if (typeof(d[4].getElementsByTagName("span")[0]) !== "undefined")
		{
			var itemName = d[1].getElementsByTagName("a")[0].text;
			//alert("d3: \n" + d[3].innerHTML);
			
			var itemEinstellung = document.getElementsByClassName(itemName)[0];
			//alert("item: "+itemEinstellung.textContent);
			if (itemEinstellung.textContent == itemName)
			{
				var index = itemEinstellung.id.substr(2,itemEinstellung.id.length);
				//alert(itemEinstellung.id + " +++ " + index);
				//+++++++++++
				//Welche Option für den Verkauf ist gewählt?
				var gewaehlteOption = document.getElementById("select_VG" + index).selectedIndex;
				
				//#################
				//Festpreis ermitteln ohne Whitespaces
				var FP = d[3].textContent.replace(/\s/g,"");
				FP = parseInt(FP);
				
				switch (gewaehlteOption) {
					case 0:
				//+++++++
				//"Nicht handeln" ist ausgewählt
					var preis = "";
					break;
					
					case 1:
				//+++++++
				//"Vorschlagspreis" ist ausgewählt
						var preis = d[4].getElementsByTagName("span")[0].firstChild.data;
						
						//
						//4% vom Angebotspreis mindestens 10
						//10% vom verkaufspreis
						if (typeof(preis) !== "undefined")
						{
							var preis = preis.slice(1, preis.length);
							
							var angebotsSteuer = preis/100*4;
							var verkaufsSteuer = preis/100*10;
							//alert(angebotsSteuer);
							if (angebotsSteuer < 10) { angebotsSteuer = 10;}

							var erlös = preis - FP - verkaufsSteuer - angebotsSteuer;
							
							//++++++++++++
							//Wenn erlös kleiner 5 dann FP
							if (erlös < 5)
							{
								var xxx = d[3].getElementsByTagName("input")[0].checked = true;
							} else {
								d[4].getElementsByTagName("input")[0].value=preis;
							}
						}
					break;
					
					case 2:
				//+++++++
				//"Preis pro AW" ist ausgewählt
						var preisProAW = document.getElementById("wert_VG" + index).value;
						//alert(preisProAW);
						var anwendungen = d[1].textContent.split("(");
						//alert(anwendungen[0]);
						anwendungen = anwendungen[anwendungen.length -1].split("/")[0];
						//anwendungen = anwendungen[anwendungen.length -1];
						//alert(anwendungen);
						var preis = anwendungen * preisProAW;
						//alert(preis);
						var angebotsSteuer = preis/100*4;
						var verkaufsSteuer = preis/100*10;
						//alert(angebotsSteuer);
						if (angebotsSteuer < 10) { angebotsSteuer = 10;}

						var erlös = preis - FP - verkaufsSteuer - angebotsSteuer;
						
						//++++++++++++
						//Wenn erlös kleiner 5 dann FP
						if (erlös < 5)
						{
							var xxx = d[3].getElementsByTagName("input")[0].checked = true;
						} else {
								d[4].getElementsByTagName("input")[0].value=preis;
						}
						
					break;
					
					case 3:
				//+++++++
				//Abschlag vom Vorschlagspreis
						var preis = d[4].getElementsByTagName("span")[0].firstChild.data;
					
						if (typeof(preis) !== "undefined")
						{
							var preis = preis.slice(1, preis.length);
							var abschlag = document.getElementById("wert_VG" + index).value;
							preis = preis - abschlag;
							
							
							var angebotsSteuer = preis/100*4;
							var verkaufsSteuer = preis/100*10;
							//alert(angebotsSteuer);
							if (angebotsSteuer < 10) { angebotsSteuer = 10;}

							var erlös = preis - FP - verkaufsSteuer - angebotsSteuer;
							//alert(erlös);
							//++++++++++++
							//Wenn erlös kleiner 5 dann FP
							if (erlös < 8)
							{
								//alert("zwangsverkauf");
								var xxx = d[3].getElementsByTagName("input")[0].checked = true;
							} else {
								d[4].getElementsByTagName("input")[0].value=preis;
							}
						}
					break;
					
					case 4:
				//+++++++
				//Festpreis
						item = d[1].textContent;
						itemsplit = item.split('(');
						anzahl = itemsplit[itemsplit.length-1];
						anzahl = anzahl.split('/')[0];
						var minAW = document.getElementById("wert_VG" + index).value;
						//alert(minAW + " ++ " + anzahl);
						if (minAW != "") {
							//alert("minAW :"+parseInt(minAW)+">=\nAnzahl:"+parseInt(anzahl));
							if (parseInt(minAW) >= parseInt(anzahl)) {
								//alert(minAW + ">=" + anzahl);
								var xxx = d[3].getElementsByTagName("input")[0].checked = true;
							}
						} else {
							//alert("else strang " + item);
							var xxx = d[3].getElementsByTagName("input")[0].checked = true;
						}
						
						var preis = "";
					break;
				}
				
				
				//d[4].getElementsByTagName("input")[0].value=preis;
			} else {
				
			}
		}
	}
alert("ende")	;
}