function x0probe() {
  return axis0Probe('x')
}

function y0probe() {
  return axis0Probe('y')
}

function z0probe() {
  return axis0Probe('z')
}

function axis0Probe(axis) {
  if(typeof axis !== 'string' || ['x', 'y', 'z'].indexOf(axis.toLowerCase()) < 0) {
    Metro.dialog.create({
      title: "<i class='fas fa-times fa-fw fg-red'> </i> Calling Probe Wizard Failed",
      content: "<div>Calling Probe Wizard Failed.  A bad property has been passed to the function. Retrying will not help, please contact the developers.</div>",
      actions: [
        {
          caption: "Close",
          cls: "js-dialog-close",
          onclick: function() {
            // nothing
          }
        }
      ]
    });
    return false
  }
  axis = axis.toLowerCase();
  const titleAxis = axis.toUpperCase()

  if (localStorage.getItem('lastProbe')) {
    var data = JSON.parse(localStorage.getItem('lastProbe'));
  } else {
    var data = { // sane default
      dist: 25,
      plate: 20,
      feedrate: 100,
      direction: titleAxis + '-'
    }
  }

  const probetemplate = `
   <table class="table">
          <tr>
            <td>
              <img src="https://image.ibb.co/mPunnf/probe-info.png" alt="probe-info" height="300" style="border: 1px solid #f1f2f3;">
            </td>

            <td style="max-width: 300px;">
              <label>Travel Distance</label>
              <input id="probetraveldist" type="number" value="` + data.dist + `" data-role="input" data-append="mm" data-prepend="<i class='fas fa-arrows-alt-v'></i>" data-clear-button="false">
              <small class="text-muted">This is how far (maximum) the ` + titleAxis + `-Probe will move downward</small>
              <hr>
              <label>Plate Thickness</label>
              <input id="probeplatethickness" type="number" value="` + data.plate + `" data-role="input" data-append="mm" data-prepend="<i class='fas fa-ruler-vertical'></i>" data-clear-button="false">
              <small class="text-muted">The offset above ` + titleAxis + `0 to the top of the plate</small>
              <hr/>
              <label>Probe Feedrate</label>
              <input id="probefeedrate" type="number" value="` + data.feedrate + `" data-role="input" data-append="mm/min" data-prepend="<i class='fas fa-sort-numeric-down'></i>" data-clear-button="false">
  <!--             <small class="text-muted">The offset above ` + titleAxis + `0 to the top of the plate</small>  -->
            </td>
          </tr>
           <tr>
            <td colspan="2">
              <small class="text-muted">
                NB: First jog to above where you want the ` + titleAxis + `-Probe to be done, and test your Probe connectivity on the Troubleshooting tab.
              </small>
            </td>
          </tr>
        </table>
  `


  Metro.dialog.create({
    title: "<i class='fas fa-podcast' data-fa-transform='rotate-180'></i> " + titleAxis + "0 Probe",
    content: probetemplate,
    width: 750,
    actions: [{
        caption: "Cancel",
        cls: "js-dialog-close",
        onclick: function() {
          //
        }
      },
      {
        caption: "Probe",
        cls: "js-dialog-close success",
        onclick: function() {
          var traveldist = $('#probetraveldist').val();
          var platethickness = $('#probeplatethickness').val();
          var feedrate = $('#probefeedrate').val();
          // alert('Probing down to ' + traveldist + "mm at " + feedrate + "mm/min and then subtracting a plate of " + platethickness + "mm");
          // sendGcode('G38.2 ' + titleAxis + '-' + traveldist + ' F' + feedrate)
          data = {
            dist: traveldist,
            plate: platethickness,
            feedrate: feedrate,
            direction: titleAxis + '-',
            axis: axis
          }
          socket.emit("zProbe", data)
          localStorage.setItem('lastProbe', JSON.stringify(data));
        }
      }
    ]
  });
}

function proberesult(data) {
  console.log(data)
  if (data.machine.probe.state > 0) {
    Metro.dialog.create({
      title: "<i class='fas fa-check fa-fw fg-green'> </i> Probe completed Succesfully",
      content: "<div>Probe completed succesfully.  " + titleAxis + "0 has been set.  Would you like to retract the probe?</div>",
      actions: [{
          caption: "Retract",
          cls: "js-dialog-close success",
          onclick: function() {
            sendGcode('$J=G91' + titleAxis + '5F' + parseInt(data.machine.probe.request.feedrate));
          }
        },
        {
          caption: "Close",
          cls: "js-dialog-close",
          onclick: function() {
            // nothing
          }
        }
      ]
    });
  } else {
    Metro.dialog.create({
      title: "<i class='fas fa-times fa-fw fg-red'> </i> Probe Failed",
      content: "<div>Probe Failed.  " + titleAxis + "0 has not been set.<br>The probe did not make contact with the base plate in the requested move.</div>",
      actions: [{
          caption: "Retry",
          cls: "js-dialog-close",
          onclick: function() {
            sendGcode('$X')
            axis0Probe(axis)
          }
        },
        {
          caption: "Close",
          cls: "js-dialog-close",
          onclick: function() {
            // nothing
          }
        }
      ]
    });
  }
}
