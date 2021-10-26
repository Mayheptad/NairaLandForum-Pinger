import http from 'http';
import puppeteer from 'puppeteer';
import mongoose from 'mongoose';
import fetch from 'node-fetch';
import {convertTZ} from './utils.js'


 const server = http.createServer((request, response)=>{
  if(request.url == "/" && request.method == "GET"){
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end("your app is working", "utf-8");
  }
}); 

mongoose.connect('mongodb+srv://admin-bill:harbey1994@cluster0.ea0lo.mongodb.net/nairalandDB?retryWrites=true&w=majority')
.catch((err)=>{console.log('Mongodb refuse to connect')});
//mongoose.connect('mongodb://localhost:27017/nlDB');

const nlSchema = mongoose.Schema({
	Time:String, done: String
})

   let convertDate; let postPingTime; let nlModel; let nlModelName; var thisMonth;

async function updateNl(){
	
try{
  const browser = await puppeteer.launch({/*headless: false,*/ args: ['--no-sandbox', '--single-process', '--no-zygote'], slowMo: 250}).catch((err)=>{throw "browser is unable to launch"});;
  const page = await browser.newPage().catch((err)=>{browser.close(); throw "browser is unable to open new page"});
  await page.setViewport({width: 1200, height: 720}).catch((err)=>{browser.close(); throw "unable to setViewport"});
 
  await page.goto('https://www.nairaland.com/login',{waitUntil: 'networkidle2',}).catch((err)=>{browser.close(); throw "browser is unable to visit nairaland login page"});
 	
  await page.type('input[name="name"]', 'oluwarichy').catch((err)=>{browser.close(); throw "could not type username"});
  await page.type('input[name="password"]', 'harbey1994').catch((err)=>{browser.close(); throw "could not type password"});
  
  await Promise.all([page.click('input[value="Login"]'), page.waitForNavigation()]).catch((err)=>{browser.close(); throw "login not succesfull or navigation timeout"}); //{ waitUntil: 'networkidle0' }
  
  //await Promise.all([page.goto('https://www.nairaland.com/followed', {waitUntil: 'networkidle0',}), page.waitForNavigation()]);

  await Promise.all([page.goto('https://www.nairaland.com/followed'), page.waitForNavigation({waitUntil: 'networkidle2',})]).catch((err)=>{browser.close(); throw "cant load followed topic page or navigation timeout"});

  //await page.goto('https://www.nairaland.com/followed', {waitUntil: 'networkidle0',});
  
  await page.waitForTimeout(2000).catch((err)=>{browser.close(); throw "error when waiting for timeout 2000"});
  
  let postArr = await page.evaluate(() => { 
	  var temArr = [];
	  
	 let p1 = document.querySelector("body > div > table:nth-child(9) > tbody > tr:nth-child(2) > td > b:nth-child(4) > a").href; let p2 = document.querySelector("body > div > table:nth-child(9) > tbody > tr:nth-child(3) > td > b:nth-child(4) > a").href; let p3 = document.querySelector("body > div > table:nth-child(9) > tbody > tr:nth-child(4) > td > b:nth-child(4) > a").href; let p4 = document.querySelector("body > div > table:nth-child(9) > tbody > tr:nth-child(5) > td > b:nth-child(4) > a").href; let p5 = document.querySelector("body > div > table:nth-child(9) > tbody > tr:nth-child(6) > td > b:nth-child(4) > a").href;
	 let p6 = document.querySelector("body > div > table:nth-child(9) > tbody > tr:nth-child(7) > td > b:nth-child(4) > a").href; let p7 = document.querySelector("body > div > table:nth-child(9) > tbody > tr:nth-child(8) > td > b:nth-child(4) > a").href; let p8 = document.querySelector("body > div > table:nth-child(9) > tbody > tr:nth-child(9) > td > b:nth-child(4) > a").href; let p9 = document.querySelector("body > div > table:nth-child(9) > tbody > tr:nth-child(10) > td > b:nth-child(4) > a").href; let p10 = document.querySelector("body > div > table:nth-child(9) > tbody > tr:nth-child(11) > td > b:nth-child(4) > a").href;
	 
     temArr.push(p10); temArr.push(p9); temArr.push(p8); temArr.push(p7); temArr.push(p6); temArr.push(p5); temArr.push(p4); temArr.push(p3); temArr.push(p2); temArr.push(p1);
			 
		return temArr;  
	}).catch((err)=>{browser.close(); throw "failed to get the follow topic url"});
	
	//console.log(postArr);
	
		 var i;
		 var len = postArr.length;
		 
	 for(i = 0; i < len; i++) {
		 
   await Promise.all([page.goto(postArr[i]), page.waitForNavigation()]).catch((err)=>{browser.close(); throw "one of the ft link failed to visit or navigation timeout"});
	
   const replyBtnUrl = await page.evaluate( _ => {
   let postId = '';
   const loc = [...location.href.slice(26)];
   for(l = 0; l < loc.length; l++){ if(isNaN(loc[l])) break; postId += loc[l];}
   return `https://www.nairaland.com/newpost?topic=${postId}`;
   });
   
   	//console.log(replyBtnUrl);
	
   if(replyBtnUrl.startsWith("https://www.nairaland.com/newpost?topic=")){
	   
   await Promise.all([page.goto(replyBtnUrl), page.waitForNavigation()]).catch((err)=>{browser.close(); throw "unable to go to reply page or navigation timeout"});
   const str = ['Always visit ', 'Go to ', 'Kindly visit ', "Don't forget to Visit ", 'Endeavour to visit ', 'Click '];
   const randNum = Math.floor(Math.random() * 400) + 1;
   const randStr = Math.floor(Math.random() * str.length);
   await page.type('#body', `${str[randStr]} https://onenewspace.com/read-blog/${randNum} for the latest, trending news & entertainment info`)
   await Promise.all([page.click('input[value="Submit"]'), page.waitForNavigation()]).catch((err)=>{browser.close(); throw "cant click submit btn after reply or navigation timeout"});
   
   }else{
	   continue;
   }
};

  /*  if (browser && browser.process() != null) {
	await browser.process().kill('SIGINT');
   } */
   
   await browser.close()
   .then( _ => {/*console.log('browser closed');*/ return postToDb('yess', 'Error occured: data could not be saved')})
   .catch( err =>{ browser.close(); throw "unable to close the browser after finish commenting on post"}); 
	 
} catch(err){
	console.log(err);
    return postToDb('nope', 'Even nope could not be saved');
}  
   }
   
updateNl();

function callUpdateNlAgain(){
setTimeout(()=>{updateNl();}, 5000);
}

function postToDb(whatTosave, errorToThrow){
  convertDate = convertTZ(new Date(),"Africa/Lagos");
  //get the current time in Nigeria timezone & save it to a variable
  postPingTime = convertDate.getHours()+":"+convertDate.getMinutes()+":"+convertDate.getSeconds();
  //change convert getMonth() to human readable formart
 switch(convertDate.getMonth()){ case 0: thisMonth = "january"; break; case 1: thisMonth = "february"; break; case 2: thisMonth = "march"; break; case 3: thisMonth = "april"; break; case 4: thisMonth = "may"; break; case 5: thisMonth = "june"; break; case 6: thisMonth = "july"; break; case 7: thisMonth = "august"; break; case 8: thisMonth = "september"; break; case 9: thisMonth = "octomber"; break; case 10: thisMonth = "november"; break; case 11: thisMonth = "december"; break; default: thisMonth = "invalid_month";}
 //create a db collection, name it using today date & month in nigeria timezone
   nlModelName = thisMonth+"_"+convertDate.getDate(); nlModel = mongoose.model(nlModelName, nlSchema);
    
  const data = new nlModel({Time: postPingTime, done: whatTosave});
 data.save().then( dataOrError => {/*console.log('data Saved', dataOrError.done );*/ return callUpdateNlAgain()})
 .catch( _ => {/*console.log(errorToThrow);*/ return callUpdateNlAgain()})
}

const pingHome = function(){
  fetch("https://hidden-wave-05524.herokuapp.com")
  .then(res => res.text())
    .then(body => console.log(body))
    .catch(err => console.error(err));
}
setInterval(pingHome, 15*60*1000); 

const pingPlaceHolder = function(){
  fetch('https://jsonplaceholder.typicode.com/todos/1')
  .then(response => response.json())
  .then(json => console.log(json))
  .catch(err => console.error(err));
}
setInterval(pingPlaceHolder, 20*60*1000); 


server.listen(process.env.PORT || 3000, _ =>console.log("server started succesfully"));
