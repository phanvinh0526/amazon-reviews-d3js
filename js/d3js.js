$(document).ready(function(){


    // update feather icons
    feather.replace()

    // Floating button activity
    $('#float-btn').on("click", function(e){
        let hVal = $(this).attr("href"); // get current value
        console.log(hVal);

        // check condition
        if(hVal == '#first'){
            hVal = '#second';
        }else{
            hVal = '#first';
        }
        // update new val
        console.log(hVal);
        $(this).attr("href", hVal);

        // Animation
        e.preventDefault();
        $('html, body').animate({ scrollTop: $($(this).attr('href')).offset().top}, 500, 'linear');

    });

    
});


// print button
var printFunc = function(){
    
    window.print();
}