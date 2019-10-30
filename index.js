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

const bulkQuestions = () => {
  const questions = [    
    {
      name: "nonRepeaters",
      type: "input",
      message: "Informe o numero de repetições:"
    },{
      name: "maxRepetitions",
      type: "input",
      message: "Informe o numero de variaveis sucessoras:"
    }
  ];
  return inquirer.prompt(questions);
};

const setQuestions = () => {
  const questions = [    
    {
      name: "setOID",
      type: "input",
      message: "Informe o OID:"
    },{
      name: "setType",
      type: "input",
      message: "Informe o tipo:"
    },{
      name: "setValue",
      type: "input",
      message: "Informe o valor:"
    }
  ];
  return inquirer.prompt(questions);
};

const walkQuestions = () => {
  const questions = [    
    {
      name: "walkOid",
      type: "input",
      message: "Informe o Oid a ser percorrido:"
    },
    {
      name: "maxRepetitions2",
      type: "input",
      message: "Informe o numero de repetições:"
    }
  ];
  return inquirer.prompt(questions);
};

const tableQuestions = () => {
  const questions = [    
    {
      name: "tableOid",
      type: "input",
      message: "Informe o Oid da tabela alvo:"
    },
    {
      name: "maxRepetitions3",
      type: "input",
      message: "Informe o numero de repetições:"
    }
  ];
  return inquirer.prompt(questions);
};

const deltaQuestions = () => {
  const questions = [    
    {
      name: "time",
      type: "input",
      message: "Informe o tempo entre as requisições em segundos:"
    },
    {
      name: "amostras",
      type: "input",
      message: "Informe o numero de amostras:"
    }
  ];
  return inquirer.prompt(questions);
};

const menu = () => {
  const questions = [    
    {
      type: "list",
      name: "MENU",
      message: "Escolha um comando para ser executado?",
      choices: ["Get", "Get Next", "Set", "Get Bulk", "Walk", "Get Table", "Get Delta", "Alterar configurações","Sair"]
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
        session.get (oids, function (error, varbinds) {          
          if (error) {
            console.error ('\n'+error.toString ());
            exit = true;            
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
        session.getNext (oids, function (error, varbinds) {
          if (error) {
            console.error (error.toString ());
            exit = true;            
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
      case "Set":          
      const setAnswers = await setQuestions();
      let { setOID, setType, setValue } = setAnswers;

        var varbinds = [{
          oid: setOID,
          type: snmp.ObjectType[setType],
          value: setValue
        }];                    
          
        session.set (varbinds, function (error, varbinds) {
          if (error) {
            console.error ('\n'+error.toString ());
          } else {
            for (var i = 0; i < varbinds.length; i++)
              console.log ('\n'+varbinds[i].oid + "|" + varbinds[i].value);
          }
        });
        resp = await wantToExit();
        if(resp['MENU'] == 'Sair'){
          exit = true;
        }
        break;
      case "Get Bulk":        
        const bulkAnswers = await bulkQuestions();
        let { nonRepeaters, maxRepetitions } = bulkAnswers;
        session.getBulk (oids, parseInt(nonRepeaters), parseInt(maxRepetitions), function (error, varbinds) {
          if (error) {
            console.error ('\n'+error.toString ());
            exit = true;            
          } else {
            // step through the non-repeaters which are single varbinds
            for (var i = 0; i < nonRepeaters; i++) {
              if (i >= varbinds.length)
                break;
              
              if (snmp.isVarbindError (varbinds[i]))
                console.error ('\n'+snmp.varbindError (varbinds[i]));
              else
                console.log ('\n'+varbinds[i].oid + "|" + varbinds[i].value);
            }
            
            // then step through the repeaters which are varbind arrays
            for (var i = nonRepeaters; i < varbinds.length; i++) {
              for (var j = 0; j < varbinds[i].length; j++) {
                if (snmp.isVarbindError (varbinds[i][j]))
                  console.error ('\n'+snmp.varbindError (varbinds[i][j]));
                else
                  console.log ('\n'+varbinds[i][j].oid + "|" + varbinds[i][j].value);
              }
            }
          }
        });
        resp = await wantToExit();
        if(resp['MENU'] == 'Sair'){
          exit = true;
        }
        break;
      case "Walk":
        function doneCb (error) {
          if (error)
            console.error ('\n'+error.toString ());
        }
        
        function feedCb (varbinds) {
          for (var i = 0; i < varbinds.length; i++) {
            if (snmp.isVarbindError (varbinds[i]))
              console.error ('\n'+snmp.varbindError (varbinds[i]));
            else
              console.log ('\n'+varbinds[i].oid + "|" + varbinds[i].value);
          }
        }
        
        const walkAnswers = await walkQuestions();
        let { walkOid, maxRepetitions2 } = walkAnswers;
        
        // The maxRepetitions argument is optional, and will be ignored unless using
        // SNMP verison 2c
        session.walk (walkOid, parseInt(maxRepetitions2), feedCb, doneCb);
        resp = await wantToExit();
        if(resp['MENU'] == 'Sair'){
          exit = true;
        }
        break;
      case "Get Table":
          function sortInt (a, b) {
            if (a > b)
              return 1;
            else if (b > a)
              return -1;
            else
              return 0;
          }
          
          function responseCb (error, table) {
            if (error) {
              console.error ('\n'+error.toString ());
            } else {
              var indexes = [];
              for (index in table)
                indexes.push (index);
                indexes.sort ();
          
              for (var i = 0; i < indexes.length; i++) {
                var columns = [];
                for (column in table[indexes[i]])
                  columns.push (parseInt (column));
                  columns.sort (sortInt);
          
                console.log ('\n'+"linha para o index = " + indexes[i]);
                for (var j = 0; j < columns.length; j++) {
                  console.log ('\n'+"   coluna " + columns[j] + " = "
                      + table[indexes[i]][columns[j]]);
                }
              }
            }
          }                 
          
          const tableAnswers = await tableQuestions();
          let { tableOid, maxRepetitions3 } = tableAnswers;
                    
          session.table (tableOid, parseInt(maxRepetitions3), responseCb);
          resp = await wantToExit();
          if(resp['MENU'] == 'Sair'){
            exit = true;
          }
          break;
      case "Get Delta":                              
        const deltaAnswers = await deltaQuestions();
        let { time, amostras } = deltaAnswers;      
        
        let counter = 0;
        function get(){
          var oidDelta = ['1.3.6.1.2.1.1.3.0'];
          session.get (oidDelta, function (error, varbinds) {          
            if (error) {
              console.error ('\n'+error.toString ());
              exit = true;            
            } else {            
              for (var i = 0; i < varbinds.length; i++) {
                if (snmp.isVarbindError (varbinds[i]))
                  console.error ('\n'+snmp.varbindError (varbinds[i]));
                else              
                  console.log ('\n'+varbinds[i].oid + "|" + varbinds[i].value);
              }
            }
          });
          counter++;
          if(counter < amostras){
            setTimeout(function(){ get() }, time*1000);
          }
        }
                  
        get();

        resp = await wantToExit();
        if(resp['MENU'] == 'Sair'){
          exit = true;
        }
        break;
      case "Alterar configurações":        
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
