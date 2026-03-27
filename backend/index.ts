import { firestore, rtdb } from "./db";
import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const userCollection = firestore.collection("users");
const roomCollection = firestore.collection("rooms");

app.use(express.static("dist"));

app.get("*", (req, res) => {
  res.sendFile(__dirname + "/dist/index.html");
});

app.post("/signup", (req, res) => {
  const email = req.body.email;
  const nombre = req.body.nombre;
  userCollection
    .where("email", "==", email)
    .get()
    .then((searchResponse) => {
      if (searchResponse.empty) {
        userCollection
          .add({
            email, //abreviatura de email: email
            nombre, //abreviatura de nombre: nombre
          })
          .then((newUserRef) => {
            res.json({
              id: newUserRef.id,
              new: true,
            });
          });
      } else {
        res.status(400).json({
          message: "user alredy exists",
        });
      }
    });
});

app.post("/auth", (req, res) => {
  //equivalente a const email = req.body.email
  const { email } = req.body;
  userCollection
    .where("email", "==", email)
    .get()
    .then((searchResponse) => {
      if (searchResponse.empty) {
        res.status(404).json({
          message: "not found",
        });
      } else {
        res.json({
          id: searchResponse.docs[0].id,
        });
      }
    });
});

app.post("/rooms", (req, res) => {
  const { userId } = req.body;

  userCollection
    .doc(userId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        console.log(
          "el usuario existe, se tendria que crear a continuacion la room",
        );

        const roomLongId = nanoid();

        rtdb
          .ref("rooms/" + roomLongId)
          .set({
            messages: [] as any,
            owner: userId,
          })
          .then(() => {
            const roomId = 1000 + Math.floor(Math.random() * 999);

            roomCollection
              .doc(roomId.toString())
              .set({
                rtdbRoomId: roomLongId,
              })
              .then(() => {
                res.json({
                  roomId: roomId.toString(),
                });
              });
          });
      } else {
        res.status(401).json({
          message: "no existis",
        });
      }
    });
});

app.get("/rooms/:roomId", (req, res) => {
  const { userId } = req.query;
  const { roomId } = req.params;

  userCollection
    .doc(userId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        roomCollection
          .doc(roomId)
          .get()
          .then((snap) => {
            if (!snap.exists) {
              //si la room no existe, se devuelve 404
              return res.status(404).json({
                message: "Room no encontrada",
              });
            }

            const data = snap.data();

            res.json(data);
          });
      } else {
        res.status(401).json({
          message: "no existis",
        });
      }
    });
});

app.listen(port, () => {
  console.log(`Iniciado en http://localhost:${port}`);
});
