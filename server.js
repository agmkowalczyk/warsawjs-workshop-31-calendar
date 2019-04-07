const express = require ('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const fs2 = require('mz/fs');
const uuid = require('uuid');

const app = express();

const port = process.env.POST || 3333;


app.listen(port, () => {
  console.log('Listening on port:', port);
});

app.use(bodyParser.json());

const data = {};


// CREATE
// curl -X POST localhost:3333/data -d '{"a":1}' -H 'Content-Type: application/json'
app.post('/data', (req, res) => {
  const id = uuid.v4();
  data[id] = req.body;
  res.status(201).json({ id });
})

// GET
// curl -X GET localhost:3333/data
app.get('/data', (req, res) => {
    res.json({ data });
})


// GET :x
// curl -X GET localhost:3333/data/5
app.get('/data/:id', (req, res) => {
  if (!data.hasOwnProperty(req.params.id)) {
    return res.status(404).json({ error: 'Not found' });
  } 
  console.log('/GET data/:id');
  // res.end('/post/:id' + req.params.id);
  res.json({ data })
})


// GET ? query
// curl -X GET localhost:3333/data?id=5
app.get('/data', (req, res) => {
  // if (req.query.a == null)
  // or 
  // if (req.query.a === undefined)
  if (req.query.id === undefined) {
    return res.status(400).json({ error: 'Error' });
  }

  res.status(200);
  res.write('/GET/data?query');
  res.write(req.query.a);
  res.end();

  // res.status(200).end('/GET/data?query', req.query.a);
})


// DELETE
// curl -X DELETE localhost:3333/data/5
app.delete('/data/:id', (req, res) => {
  if (!data.hasOwnProperty(req.params.id)) {
    return res.status(404).json({ error: 'Not found' });
  } 
  delete data[req.params.id];
  res.status(200).json({ message: 'DELETE success' });
})


// PUT
// curl -X PUT localhost:3333/data/5 -d '{"a":1}' -H 'Content-Type: application/json'
app.put('/data/:id', (req, res) => {
  if (!data.hasOwnProperty(req.params.id)) {
    return res.status(404).json({ error: 'Not found' });
  } 
  data[req.params.id] = req.body;
  res.status(201).json({ message: 'PUT success' });
})


// PATCH
// curl -X PATCH localhost:3333/data/5 -d '{"b":2}' -H 'Content-Type: application/json'
app.patch('/data/:id', (req, res) => {
  if (!data.hasOwnProperty(req.params.id)) {
    return res.status(404).json({ error: 'Not found' });
  } 
  const oldValue = data[req.params.id];
  const newValue = req.body;
  data[req.params.id] = { ...oldValue, ...newValue };
  res.status(200).json({ message: 'PATCH success' });
})




// GET promises and async

function getData(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(data[id]);
    }, 2000);
  });
}

function getData2(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ data2: 'ok' });
    }, 2000);
  });
}


// GET promise
app.get('/data-promise/:id', (req, res) => {
  if (!data.hasOwnProperty(req.params.id)) {
    return res.status(404).json({ error: 'Not found' });
  } 
  const promise = getData(req.params.id);
  const promise2 = getData2(req.params.id);
 
  promise.then((value) => {
    promise2.then((value2) => {
      res.json({ result: { res: value, res2: value2 } });
    });
  });
});

/* RESULT
  {
      "result": {
          "res": {
              "p": 1
          },
          "res2": {
              "data2": "ok"
          }
      }
  }
*/



// GET Promise.all
app.get('/data-promise-all/:id', async(req, res) => {
  if (!data.hasOwnProperty(req.params.id)) {
    return res.status(404).json({ error: 'Not found' });
  } 
  const promise = getData(req.params.id);
  const promise2 = getData2(req.params.id);

  Promise.all([promise, promise2])
  .then((array) => {
    res.json(array);
  });
});

/* RESULT
  [
      {
          "p": 1
      },
      {
          "data2": "ok"
      }
  ]
*/



// GET async/await
app.get('/data-async/:id', async(req, res) => {
  if (!data.hasOwnProperty(req.params.id)) {
    return res.status(404).json({ error: 'Not found' });
  } 
  const promise = await getData(req.params.id);
  const promise2 = await getData2(req.params.id);

  res.json({ promise, promise2, message: 'ASYNC success' });
});

/* RESULT 
  {
    "promise": {
        "p": 1
    },
    "promise2": {
        "data2": "ok"
    },
    "message": "ASYNC success"
  }
*/




// READ FILE
// node style callbacks
app.get('/file', (req, res) => {
  fs.readFile('file.txt', 'utf-8', (err, data) => {
    if (err) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ data });
  })
})

// READ FILE
// promises
app.get('/file2', (req, res) => {
  fs2.readFile('file.txt', 'utf-8')
    .then((data) => {
    res.json({ data });
  }).catch((err) => {
    res.status(404).json({ error: 'Not found' });
  })
})

// READ FILE
// async / await
app.get('/file3', async (req, res) => {
  try {
    res.json({ data: await fs2.readFile('file.txt', 'utf-8') });
  } catch (err) {
    res.status(404).json({ error: 'Not found async' });
  }
})