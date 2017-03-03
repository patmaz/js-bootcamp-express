$('#form').on('submit', function(e) {
    var data = $('#form').serializeArray();
    var dataObj = {};
    data.forEach(function(item, index) {
        dataObj[item.name] = item.value;
    });
    dataObj.displayName = $('body').data('displayname');
    $.ajax({
        type: "POST",
        url: "/post/json",
        data: JSON.stringify(dataObj),
        success: function() {},
        dataType: "json",
        contentType: "application/json"
    }).done(function(xhr) {
        window.location.href = xhr.redirect;
    }).fail(function(xhr, status, err) {
        console.log(xhr);
        console.log(status);
        console.log(err);
    });
    e.preventDefault();
});
