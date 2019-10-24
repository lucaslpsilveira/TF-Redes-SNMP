const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
require('shelljs-plugin-clear');
const shell = require("shelljs");
const snmp = require("net-snmp");

const init = () => {
  console.log(
    chalk.green(
      figlet.textSync("TF-Redes")
    )
  );
}

const askQuestions = () => {
  const questions = [    
    {
      name: "IP",
      type: "input",
      message: "Informe o endereço da mib:"
    },{
      name: "OID",
      type: "input",
      message: "Informe o OID desejado:"
    },{
      name: "COMUNNITY",
      type: "input",
      message: "Informe a comunidade desejada:"
    },
  ];
  return inquirer.prompt(questions);
};

const menu = () => {
  const questions = [    
    {
      type: "list",
      name: "MENU",
      message: "Escolha um comando para ser executado?",
      choices: ["Get", "Get Next","Alterar configurações","Sair"]
    }
  ];
  return inquirer.prompt(questions);
};

const wantToExit = () => {
  const questions = [
    {
      type: "list",
      name: "MENU",
      message: "Oque deseja fazer?",
      choices: ["Voltar ao menu", "Sair"]
    }
  ];
  return inquirer.prompt(questions);
};

const run = async () => {  
  let exit = false;
  shell.clear();
  // show script introduction
  init();  
  // ask questions
  const answers = await askQuestions();
  let { IP, OID, COMMUNITY } = answers;
  var oids = [OID];
  var session = snmp.createSession (IP, COMMUNITY, {version: snmp.Version2c});
  while(!exit){   
    shell.clear();
    init();       
    // ask questions
      let resp = null;
      const menuResp = await menu();
      const { MENU } = menuResp;
    // execute comands
    switch(MENU){
      // exemplos de uso: https://github.com/nospaceships/node-net-snmp/tree/master/example
      case "Get":
        console.log("Get");                                  
        session.get (oids, function (error, varbinds) {          
          if (error) {
            console.error ('\n'+error.toString ());
          } else {            
            for (var i = 0; i < varbinds.length; i++) {
              if (snmp.isVarbindError (varbinds[i]))
                console.error ('\n'+snmp.varbindError (varbinds[i]));
              else              
                console.log ('\n'+varbinds[i].oid + "|" + varbinds[i].value);
            }
          }
        });
        resp = await wantToExit();
        if(resp['MENU'] == 'Sair'){
          exit = true;
        }
        break;
      case "Get Next":
        console.log("Get");  
        resp = await wantToExit();
        if(resp['MENU'] == 'Sair'){
          exit = true;
        }
        break;
      case "Alterar configurações":
        console.log("Get");  
        const answers = await askQuestions();              
        IP = answers['IP'];
        OID = answers['OID'];
        oids = [OID];
        COMMUNITY = answers['COMMUNITY'];        
        session = snmp.createSession (IP, COMMUNITY, {version: snmp.Version2c});
        break;
      case "Sair":
        console.log("Sair");  
        exit = true;
        break;
      default:
        console.log("Error");
	  break;
    }
  }
  // show success message
};

run();
