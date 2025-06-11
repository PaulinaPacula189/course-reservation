import { useEffect, useState } from 'react';
import { db, auth } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { motion, AnimatePresence } from "framer-motion";
import { FaMoneyBillWave, FaUserAlt, FaCalendarAlt } from 'react-icons/fa';

function App() {
  const [courses, setCourses] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEnglish, setIsEnglish] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [newCoursePrice, setNewCoursePrice] = useState('');
  const [newCourseSeats, setNewCourseSeats] = useState('');
  const [newCourseStartDate, setNewCourseStartDate] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const categories = ['Web Development', 'Design', 'Marketing'];
  const pinkTheme = {
    primary: '#FF69B4',
    secondary: '#FFB6C1',
    accent: '#FF1493',
    background: '#FFF0F6',
    text: '#8B008B'
  };

  const fetchCourses = async () => {
    const querySnapshot = await getDocs(collection(db, "courses"));
    const coursesList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setCourses(coursesList);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Rejestracja/logowanie dla zwykłych użytkowników
  const handleUserAuth = async (e, isLogin) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setIsLoggedIn(true);
      setError('');
    } catch (error) {
      setError(isEnglish ? `Error: ${error.message}` : `Błąd: ${error.message}`);
    }
  };

  // Rejestracja/logowanie dla adminów
  const handleAdminAuth = async (e, isLogin) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      const userRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(userRef);
      setIsAdmin(docSnap.exists() && docSnap.data().admin);
      setIsLoggedIn(true);
      setError('');
    } catch (error) {
      setError(isEnglish ? `Error: ${error.message}` : `Błąd: ${error.message}`);
    }
  };

  // Rezerwacja kursu po podaniu emaila (bez hasła)
  const handleReservation = async (e) => {
    e.preventDefault();
    if (!selectedCourse || selectedCourse.seats < 1) return;
    try {
      const courseRef = doc(db, "courses", selectedCourse.id);
      await updateDoc(courseRef, {
        seats: selectedCourse.seats - 1
      });
      await addDoc(collection(db, "reservations"), {
        courseId: selectedCourse.id,
        courseTitle: selectedCourse.title,
        userEmail: email,
        date: new Date().toISOString()
      });
      const updatedCourses = courses.map(c => 
        c.id === selectedCourse.id ? { ...c, seats: c.seats - 1 } : c
      );
      setCourses(updatedCourses);
      alert(isEnglish ? 'Reservation successful! Check your email.' : 'Rezerwacja udana! Sprawdź swój email.');
      setSelectedCourse(null);
      setEmail('');
    } catch (error) {
      setError(isEnglish ? `Error: ${error.message}` : `Błąd: ${error.message}`);
    }
  };

  // Dodawanie kursu przez admina (zabezpieczenie przed ujemnymi miejscami)
  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "courses"), {
        title: newCourseTitle,
        description: newCourseDescription,
        price: Number(newCoursePrice),
        seats: Math.max(0, Number(newCourseSeats)),
        startDate: newCourseStartDate,
        category: newCourseCategory
      });
      alert(isEnglish ? 'Course added!' : 'Kurs dodany!');
      fetchCourses();
      setNewCourseTitle('');
      setNewCourseDescription('');
      setNewCoursePrice('');
      setNewCourseSeats('');
      setNewCourseStartDate('');
      setNewCourseCategory('');
    } catch (error) {
      alert(isEnglish ? 'Error adding course' : 'Błąd podczas dodawania kursu');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setEmail('');
    setPassword('');
  };

  return (
    <div style={{ width: '100%', backgroundColor: pinkTheme.background, minHeight: '100vh' }}>
      <div style={{ backgroundColor: pinkTheme.primary, color: 'white', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ margin: 0 }}>{isEnglish ? 'E-Learning Platform' : 'Platforma E-Learningowa'}</h1>
      </div>

      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
        <button
          onClick={() => setIsEnglish(!isEnglish)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '5px 10px',
            backgroundColor: pinkTheme.secondary,
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            color: pinkTheme.text
          }}
        >
          {isEnglish ? 'Polski' : 'English'}
        </button>

        {!isLoggedIn ? (
          <div>
            <div style={{ 
              margin: '20px 0', 
              padding: '20px', 
              border: `2px solid ${pinkTheme.accent}`, 
              borderRadius: '8px',
              backgroundColor: 'white'
            }}>
              <h2 style={{ color: pinkTheme.text }}>{isEnglish ? 'User Login / Register' : 'Logowanie / Rejestracja'}</h2>
              <form onSubmit={(e) => handleUserAuth(e, true)} style={{ marginBottom: '20px' }}>
                <input
                  type="email"
                  placeholder={isEnglish ? 'Email' : 'Email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', margin: '8px 0', border: `1px solid ${pinkTheme.primary}` }}
                />
                <input
                  type="password"
                  placeholder={isEnglish ? 'Password' : 'Hasło'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', margin: '8px 0', border: `1px solid ${pinkTheme.primary}` }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      backgroundColor: pinkTheme.accent,
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    {isEnglish ? 'Login' : 'Zaloguj się'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleUserAuth(e, false)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: pinkTheme.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    {isEnglish ? 'Register' : 'Zarejestruj się'}
                  </button>
                </div>
              </form>
              
              <button
                onClick={() => setShowAdminLogin(!showAdminLogin)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: pinkTheme.secondary,
                  color: pinkTheme.text,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {isEnglish ? 'Admin Login' : 'Logowanie dla adminów'}
              </button>
            </div>

            {showAdminLogin && (
              <div style={{ 
                margin: '20px 0', 
                padding: '20px', 
                border: `2px solid ${pinkTheme.accent}`, 
                borderRadius: '8px',
                backgroundColor: 'white'
              }}>
                <h2 style={{ color: pinkTheme.text }}>{isEnglish ? 'Admin Login' : 'Logowanie admina'}</h2>
                <form onSubmit={(e) => handleAdminAuth(e, true)}>
                  <input
                    type="email"
                    placeholder={isEnglish ? 'Email' : 'Email'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', margin: '8px 0', border: `1px solid ${pinkTheme.primary}` }}
                  />
                  <input
                    type="password"
                    placeholder={isEnglish ? 'Password' : 'Hasło'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', margin: '8px 0', border: `1px solid ${pinkTheme.primary}` }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      backgroundColor: pinkTheme.accent,
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    {isEnglish ? 'Admin Login' : 'Zaloguj się jako admin'}
                  </button>
                </form>
              </div>
            )}
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          </div>
        ) : (
          <div>
            <button
              onClick={handleLogout}
              style={{
                marginBottom: '20px',
                padding: '5px 10px',
                backgroundColor: pinkTheme.secondary,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                color: pinkTheme.text
              }}
            >
              {isEnglish ? 'Logout' : 'Wyloguj się'}
            </button>

            {isAdmin && (
              <div style={{ 
                margin: '20px 0', 
                padding: '20px', 
                border: `2px solid ${pinkTheme.accent}`, 
                borderRadius: '8px',
                backgroundColor: 'white'
              }}>
                <h3 style={{ color: pinkTheme.text }}>{isEnglish ? 'Admin Panel' : 'Panel administratora'}</h3>
                <form onSubmit={handleAddCourse}>
                  <input
                    type="text"
                    placeholder={isEnglish ? 'Course title' : 'Tytuł kursu'}
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', margin: '8px 0', border: `1px solid ${pinkTheme.primary}` }}
                  />
                  <input
                    type="text"
                    placeholder={isEnglish ? 'Description' : 'Opis'}
                    value={newCourseDescription}
                    onChange={(e) => setNewCourseDescription(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', margin: '8px 0', border: `1px solid ${pinkTheme.primary}` }}
                  />
                  <input
                    type="number"
                    placeholder={isEnglish ? 'Price' : 'Cena'}
                    value={newCoursePrice}
                    onChange={(e) => setNewCoursePrice(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', margin: '8px 0', border: `1px solid ${pinkTheme.primary}` }}
                  />
                  <input
                    type="number"
                    placeholder={isEnglish ? 'Seats' : 'Miejsca'}
                    value={newCourseSeats}
                    onChange={(e) => setNewCourseSeats(e.target.value)}
                    min="0"
                    required
                    style={{ width: '100%', padding: '8px', margin: '8px 0', border: `1px solid ${pinkTheme.primary}` }}
                  />
                  <input
                    type="text"
                    placeholder={isEnglish ? 'Start date' : 'Data rozpoczęcia'}
                    value={newCourseStartDate}
                    onChange={(e) => setNewCourseStartDate(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', margin: '8px 0', border: `1px solid ${pinkTheme.primary}` }}
                  />
                  <select
                    value={newCourseCategory}
                    onChange={(e) => setNewCourseCategory(e.target.value)}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      margin: '8px 0', 
                      border: `1px solid ${pinkTheme.primary}`,
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">{isEnglish ? 'Select category' : 'Wybierz kategorię'}</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      backgroundColor: pinkTheme.accent,
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    {isEnglish ? 'Add course' : 'Dodaj kurs'}
                  </button>
                </form>
              </div>
            )}

            {!selectedCategory ? (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: pinkTheme.text }}>{isEnglish ? 'Choose a category' : 'Wybierz kategorię'}</h2>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    style={{
                      margin: '10px',
                      padding: '10px 20px',
                      backgroundColor: pinkTheme.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      transition: 'all 0.2s',
                      ':hover': {
                        backgroundColor: pinkTheme.accent
                      }
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  style={{
                    marginBottom: '20px',
                    padding: '5px 10px',
                    backgroundColor: pinkTheme.secondary,
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: pinkTheme.text
                  }}
                >
                  {isEnglish ? 'Back to categories' : 'Wróć do kategorii'}
                </button>

                {courses
                  .filter(course => course.category === selectedCategory)
                  .map(course => (
                    <div
                      key={course.id}
                      style={{
                        margin: '20px 0',
                        padding: '20px',
                        border: `2px solid ${pinkTheme.primary}`,
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <h2 style={{ color: pinkTheme.text }}>{course.title}</h2>
                      <p style={{ color: pinkTheme.text }}>{course.description}</p>
                      <p>
                        <FaMoneyBillWave style={{ marginRight: '8px', color: pinkTheme.primary }} />
                        <strong style={{ color: pinkTheme.text }}>{isEnglish ? 'Price' : 'Cena'}:</strong> 
                        <span style={{ color: pinkTheme.text }}> {course.price} zł</span>
                      </p>
                      <p>
                        <FaUserAlt style={{ marginRight: '8px', color: pinkTheme.primary }} />
                        <strong style={{ color: pinkTheme.text }}>{isEnglish ? 'Seats left' : 'Pozostało miejsc'}:</strong> 
                        <span style={{ color: pinkTheme.text }}> {course.seats}</span>
                      </p>
                      <p>
                        <FaCalendarAlt style={{ marginRight: '8px', color: pinkTheme.primary }} />
                        <strong style={{ color: pinkTheme.text }}>{isEnglish ? 'Start date' : 'Data rozpoczęcia'}:</strong> 
                        <span style={{ color: pinkTheme.text }}> {course.startDate}</span>
                      </p>

                      {course.seats === 0 ? (
                        <p style={{ color: 'red', marginTop: '10px' }}>
                          {isEnglish ? 'No seats available' : 'Brak miejsc'}
                        </p>
                      ) : (
                        !isAdmin && (
                          <button
                            onClick={() => setSelectedCourse(course)}
                            style={{
                              marginTop: '10px',
                              padding: '10px 20px',
                              backgroundColor: pinkTheme.primary,
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '16px',
                              transition: 'all 0.2s',
                              ':hover': {
                                backgroundColor: pinkTheme.accent
                              }
                            }}
                          >
                            {isEnglish ? 'Book a seat' : 'Zarezerwuj miejsce'}
                          </button>
                        )
                      )}

                      <AnimatePresence>
                        {selectedCourse?.id === course.id && !isAdmin && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <form onSubmit={handleReservation} style={{ marginTop: '15px' }}>
                              <div style={{ margin: '10px 0' }}>
                                <input
                                  type="email"
                                  placeholder={isEnglish ? 'Email' : 'Email'}
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  required
                                  style={{ 
                                    width: '100%', 
                                    padding: '8px', 
                                    border: `1px solid ${pinkTheme.primary}` 
                                  }}
                                />
                              </div>
                              <button
                                type="submit"
                                style={{
                                  padding: '10px 20px',
                                  backgroundColor: pinkTheme.accent,
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  width: '100%'
                                }}
                              >
                                {isEnglish ? 'Confirm reservation' : 'Potwierdź rezerwację'}
                              </button>
                              {error && <p style={{ color: 'red' }}>{error}</p>}
                            </form>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ 
        backgroundColor: pinkTheme.primary, 
        color: 'white', 
        padding: '20px', 
        marginTop: '40px', 
        textAlign: 'center' 
      }}>
        <p style={{ margin: 0 }}>{isEnglish ? '© 2025 E-Learning Platform' : '© 2025 Platforma E-Learningowa'}</p>
      </div>
    </div>
  );
}

export default App;



