const trainingData = [
    // 📊 Rapoarte și Calendar
    ["calendar", "show_calendar"],
    ["rezervari", "show_calendar"],
    ["rezervările", "show_calendar"],
    ["programul", "show_calendar"],
    ["rapoarte", "show_reports"],
    ["statistici", "show_reports"],
    ["raport zilnic", "show_reports"],
    ["raport lunar", "show_reports"],
    ["raport anual", "show_reports"],
  
    // 🛒 POS și Vânzări
    ["pos", "show_pos"],
    ["deschide POS-ul", "show_pos"],
    ["vanzare", "show_pos"],
    ["vinde", "show_pos"],
    ["vinde cafea camera 101", "sell_product"],
    ["adauga suc camera 205", "sell_product"],
    ["vinde bere 301", "sell_product"],
    ["adauga produse camera 102", "sell_product"],
  
    // 📄 Facturi
    ["facturi", "show_invoices"],
    ["deschide facturile", "show_invoices"],
    ["facturile", "show_invoices"],
    ["gestionează facturile", "show_invoices"],
    ["factura 101", "show_room_invoice"],
    ["vezi factura camera 205", "show_room_invoice"],
    ["arată factura 301", "show_room_invoice"],
  
    // 📦 Inventar
    ["inventar", "show_stock"],
    ["stock", "show_stock"],
    ["stocuri", "show_stock"],
    ["deschide stocurile", "show_stock"],
    ["produse", "show_stock"],

    // 🏨 Management Camere
    ["creeaza cam 101 single 200", "create_room"],
    ["adauga camera 205 dubla 300", "create_room"],
    ["creeaza camera 301 apartament 500", "create_room"],
    ["modifica cam 101", "modify_room"],
    ["actualizeaza camera 205", "modify_room"],
    ["sterge cam 101", "delete_room"],
    ["elimina camera 205", "delete_room"],

    // 📞 Adăugare Telefon
    ["tel 101 15 mar 0722123456", "add_phone"],
    ["telefon 205 24 apr 0733123456", "add_phone"],
    ["adauga telefon 301 0744123456", "add_phone"],

    // 🏨 Rezervări
    ["rezervare camera dubla pe 14 apr", "reservation"],
    ["rezerv o suita pentru Ion Popescu", "reservation"],
    ["rezerva o camera twin pentru Andrei Ionescu pe 12-14 mar", "reservation"],
    ["vreau dubla pentru 24 feb", "reservation"],
    ["rezerva un apartament pentru Mihai Popescu intre 10 si 15 mai", "reservation"],
    ["fa o rezervare la hotel pentru Ana pe 5-10 iul", "reservation"],
    ["rezervare dubla Mihai 24 feb", "reservation"],
    ["rezerva o camera deluxe fumator pe 20-23 august", "reservation"],
    ["vreau o camera dubla de pe 12 pana pe 15 iunie", "reservation"],
    ["fa o rezervare pentru un apartament in perioada 5-9 sept", "reservation"],
    ["rez camera twin 10-12 oct", "reservation"],
    ["vreau un apartament 8-12 noiembrie", "reservation"],
    ["rezer o camera dubla 3 nopti in decembrie", "reservation"],
    ["res o camera single pentru 3 nopti in februarie", "reservation"],
  
    // 🔄 Modificări de rezervare
    ["modifica rezervarea lui Andrei Ionescu pentru 25 mai", "modify_reservation"],
    ["vreau sa schimb data rezervării mele pentru 10 martie", "modify_reservation"],
    ["schimba rezervarea lui Mihai Popescu la 15 aprilie", "modify_reservation"],
    ["muta rezervarea pe 12-15 septembrie", "modify_reservation"],
    
    // ❌ Anulări de rezervare
    ["anuleaza rezervarea lui Mihai Popescu din 20 aprilie", "cancel_reservation"],
    ["vreau să anulez rezervarea pentru Ana pe 5 iulie", "cancel_reservation"],
    ["sterge rezervarea mea pentru 10-12 iunie", "cancel_reservation"],
  ];
  
  module.exports = trainingData;