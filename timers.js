let interval = undefined;
let inittimer = [0,0];
let seconds = [0,0];

let sounds = {
    'trap': {
        start: 'sfx/trap/FLS_Scratch hit 80bpm_2.ogg',
        rest: 'sfx/trap/FLS_Scratch hit 120bpm_2.ogg',
        end: 'sfx/trap/instantrapairhorn.ogg'
    },
    'mattix': {
        start: 'sfx/mattix/404151__mattix__select-granted-01.wav',
        rest: 'sfx/mattix/459344__mattix__select-granted-03.wav',
        end: 'sfx/mattix/473606__mattix__access-denied-01.wav'
    }
}


let prefs = JSON.parse(localStorage.getItem('workit_prefs')) || {};

startTimer = () => {
    console.log('⏱ start')

    let timer = document.querySelector('fieldset.timer-row.queued:not(.running)');
    timer 
        ? timer.classList.add('running')
        : '';

    let exercise = document.querySelector('.queued input[name=exercise]');
    let rest = document.querySelector('.queued input[name=rest]');

    if(!exercise && !rest) {
        console.log('🏁 finish')
        playSound('end');
        resetTimer();
        return false;
    }

    inittimer = [parseInt(exercise.value), parseInt(rest.value)];

    if(exercise) seconds[0] = parseInt(exercise.value);
    if(rest) seconds[1] = parseInt(rest.value);

    interval = setInterval(countDown.bind(this), 1000);
    playSound('start');
}

countDown = () => {
    
    let exercise = document.querySelector('.running input[name=exercise]');
    let rest = document.querySelector('.running input[name=rest]');
    let timers = document.querySelectorAll('fieldset.timer-row.queued:not(.complete)');

    console.log(`init: ${inittimer}, seconds ${seconds}, timers ${timers[0]}`);

    if(seconds[0] > 0) {
        console.log('🏋')
        seconds[0]--;
        exercise.value = seconds[0];
    } else if (seconds[1] > 0) {
        console.log('😌')
        seconds[1]--;
        rest.value = seconds[1];
    }

    if (seconds[0] === inittimer[0] && seconds[1] === inittimer[1]) {
        console.log('init');
    }

    // 😤 exercise done
    if (seconds[0] === 0 && seconds[1] === inittimer[1]) {
        console.log('✅ exercise done');
        playSound('rest');
    }

    // 😌 rest done
    if(seconds[0] <= 0 && seconds[1] <= 0) {
        console.log('✅ rest done');
        console.log('reset ⏱');

        resetTimer();
        
        if(timers.length > 0) {
            console.log('✅ rep complete');
            let completed = document.querySelector('fieldset.timer-row.queued');
            completed.classList.remove('running');
            completed.classList.remove('queued');
            completed.classList.add('completed');

            startTimer();
        }
    }

    // all done
    if(timers.length == 0) {
        console.log('✅ finish rep');

        playSound('end');
        
        let completed = document.querySelector('.queued.running');
        if(completed) {
            completed.classList.remove('queued')
            completed.classList.remove('running')
            completed.classList.add('completed')
        }
        resetTimer();

        return false;
    }

}

updateTemplateTimes = (event) => {
    let template = document.querySelector(`#timer-row`);
    template.content.querySelector(`input[name=${event.target.name}]`).value = event.target.value;
}

addNewTimer = () => {
    let template = document.querySelector('#timer-row');
    
    let clone =  document.importNode(template.content, true);
    let parent = document.querySelector('.reps');
    
    let exerInput = clone.querySelector('input[name=exercise]');
    let restInput = clone.querySelector('input[name=rest]');

    parent.appendChild(clone);
    
    (parent.children[parent.children.length - 1]).scrollIntoView(true);

    exerInput.addEventListener('change', updateTemplateTimes);
    restInput.addEventListener('change', updateTemplateTimes);
}

resetTimer = () => {
    console.log('cancel')
    seconds = [0,0];
    clearInterval(interval);
}

playSound = (sound) => {
    console.log(`📢 ${sound}`);
    // cancelAllSounds();
    let audio = document.querySelector(`audio[name="${sound}"]`);
    audio.play();
}

cancelAllSounds = () => {
    let audios = document.querySelectorAll(`audio`);

    for(audio of audios) {
        audio.pause();
        audio.src = audio.currentSrc;
    }
}

toggleSettings = (event) => {
    event.stopPropagation();
    event.preventDefault();

    document.location.hash !== '#settings' 
        ? document.location.assign('#settings')
        : document.location.assign('#workout')
    return false;
}

updateSoundSettings = () => {
    let sound_settings = {
        volume: document.querySelector('input[name=volume]').value / 100,
        soundfx: {
            'trap': {
                start: 'sfx/trap/FLS_Scratch hit 80bpm_2.ogg',
                rest: 'sfx/trap/FLS_Scratch hit 120bpm_2.ogg',
                end: 'sfx/trap/instantrapairhorn.ogg'
            },
            'mattix': {
                start: 'sfx/mattix/404151__mattix__select-granted-01.wav',
                rest: 'sfx/mattix/459344__mattix__select-granted-03.wav',
                end: 'sfx/mattix/473606__mattix__access-denied-01.wav'
            }
        }
    };
}

initSoundSettings = () => {
    let audios = document.querySelectorAll('audio');

    for (let audio of audios) {
        if (prefs && prefs.volume) {
            audio.volume = prefs.volume;
            document.querySelector('#settings input[name=volume]').value = prefs.volume;
        }
    
        if (prefs && prefs.soundfx) {
            audio.src = sounds[prefs.soundfx][audio.getAttribute('name')];
            document.querySelector('#settings select[name=soundfx]').value = prefs.soundfx;
        }
    }

}


init = () => {
    
    initSoundSettings();
    
    if(prefs && prefs.times) {
        let template = document.querySelector('#timer-row').content;
        template.querySelector('input[name=exercise]').value = prefs.times[0];
        template.querySelector('input[name=rest]').value = prefs.times[1];

        let settingsForm = document.querySelector('#settings');
        settingsForm.querySelector('[name=workout_time]').value = prefs.times[0];
        settingsForm.querySelector('[name=rest_time]').value = prefs.times[1];
    }

    let timerForm = document.querySelector('form');
    timerForm.addEventListener('submit', (event) => {
        startTimer();
        event.target.focus();
    });

    let addtimerBtn = timerForm.querySelector('button[name=addrep]');
    addtimerBtn.addEventListener('click', function(event){
        
        addNewTimer();
        event.target.blur();
    });

    let resetBtn = timerForm.querySelector('button[type=reset]');
    resetBtn.addEventListener('click', function(event){
        resetTimer();
        event.target.blur();
        (document.querySelector('.reps')).classList.add('clearing');
        
        setTimeout(function(){
            (document.querySelector('.reps')).classList.remove('clearing');
            (document.querySelector('.reps')).innerHTML = '';
        }, 1500);
    });

    let toggleSettingsBtns = document.querySelectorAll('button[type=menu]');
    Array.from(toggleSettingsBtns).map(btn => {
        btn.addEventListener('click', function(event) {
            toggleSettings(event);
        })
    });


    let saveSettingsBtn = document.querySelector('#settings button[name=saveprefs]');
    saveSettingsBtn.addEventListener('click', function(event){
        event.preventDefault();
        
        let settingsForm = document.querySelector('#settings');

        let defaults = {
            times: [
                parseInt(settingsForm.querySelector('input[name=workout_time]').value),
                parseInt(settingsForm.querySelector('input[name=rest_time]').value)
            ],
            soundfx: settingsForm.querySelector('select').value,
            volume: settingsForm.querySelector('input[name=volume]').value
        }

        localStorage.setItem('workit_prefs', JSON.stringify(defaults));
        prefs = defaults;

        let template = document.querySelector('#timer-row').content;

        (template.querySelector('[name=exercise]')).value = defaults.times[0];
        (template.querySelector('[name=rest]')).value = defaults.times[1];
        
        initSoundSettings();

        return false;
    });
}

window.addEventListener('load', function(){
    init();
});
