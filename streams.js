// V1.0.0.0

const config = {
    ControlPort: 20012,
    /*            ControlIP: '127.0.0.1', */
    ControlIP: 'corelink.hpc.nyu.edu',
    autoReconnect: false,
    /*
      for service in a local network please replace the certificate with the appropriate version
    cert: '<corelink-tools-repo>/config/ca-crt.pem'
    */
  }
  const username = 'Testuser'
  const password = 'Testpassword'
  const corelink = require('corelink-client')
  
  // Setup
  const workspace = 'Holodeck'
  const protocol = 'tcp'
  const datatype = 'distance'
  
  corelink.debug = true
  
  let iter = 0
  
  function randomdata() {
    iter++
    console.log(iter.toString())
    return iter.toString()
  }
  const run = async () => {
    let sender
    if (await corelink.connect({ username, password }, config).catch((err) => { console.log(err) })) {
      sender = await corelink.createSender({
        workspace,
        protocol,
        type: datatype,
        metadata: { name: 'Random Data' },
      }).catch((err) => { console.log(err) })
    }
    
    if (sender) {
      console.log('Stream Created:', sender); // Log the sender details
    } else {
      console.log('Failed to create stream.');
    }
  
    setInterval(() => corelink.send(sender, Buffer.from(randomdata())), 1000)
  }
  
  // Export the run function
run();
