import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Button, Typography, TextField, Card, CardContent } from '@mui/material';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

function CourseDetails() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      const docRef = doc(db, "courses", courseId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCourse(docSnap.data());
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleReservation = async () => {
    try {
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, password);
      const courseRef = doc(db, "courses", courseId);
      await updateDoc(courseRef, {
        seats: course.seats - 1
      });
      alert('Rezerwacja udana!');
    } catch (error) {
      alert(`Błąd: ${error.message}`);
    }
  };

  if (!course) return <div>Ładowanie...</div>;

  return (
    <Card style={{ maxWidth: '600px', margin: '20px' }}>
      <CardContent>
        <Typography variant="h4">{course.title}</Typography>
        <Typography variant="h6">Cena: {course.price} zł</Typography>
        <Typography>Pozostało miejsc: {course.seats}</Typography>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Hasło"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button 
          variant="contained" 
          color="success" 
          onClick={handleReservation}
          style={{ marginTop: '20px' }}
        >
          Zarezerwuj miejsce
        </Button>
      </CardContent>
    </Card>
  );
}

export default CourseDetails;
