document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br', // Define o idioma para português do Brasil
        dateClick: function(info) {
            let modal = new bootstrap.Modal(document.getElementById('modalData'));
            //Inserir o resto da funcionalidade aqui
            modal.show();

        }
    });
    
    calendar.render();
});
