
const got = require('got');
getCat = () => {
  return new Promise( (res,rej)=>{
    got('http://www.random.cat/meow').then(res => {
      try{
        const f = JSON.parse(res.body).file;
        f?res(f):rej('File not found');
      }catch(err){
        rej(err);
      }
    }).catch(rej);
  });
};

module.exports = {
  name: "cat",
  perm: ["server.cat"],
  async func(msg, { send }) {
    try{
      const f = await getCat();
      await send(f);
    }catch(err){
      await send('The cat photographer went missing!');
    }
  }
};

/*
getCat = () => {
  got('http://www.random.cat/meow').then(res => {
    try {
      callback(undefined, JSON.parse(res.body).file);
    } catch (err) {
      callback(err);
    }
  }).catch(callback);
};
*/
