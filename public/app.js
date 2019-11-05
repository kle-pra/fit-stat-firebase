// listen for auth changes
auth.onAuthStateChanged(user => {
  setupUi(user);
  fetchWorkouts(user);
});

// signup
const signupForm = document.getElementById('signup-form');
signupForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = signupForm['signup-email'].value;
  const password = signupForm['signup-password'].value;
  const aboutMe = signupForm['about-me'].value;
  const errorMsg = signupForm.querySelector('.error');
  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => db.collection(`users`).doc(`${cred.user.uid}`).set({ aboutMe }))
    .then(() => {
      M.Modal.getInstance(document.getElementById('modal-signup')).close();
      signupForm.reset();
      errorMsg.innerText = '';
    })
    .catch(error => {
      errorMsg.innerText = error.message;
    });
});

// signin
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = loginForm['login-email'].value;
  const password = loginForm['login-password'].value;
  const errorMsg = loginForm.querySelector('.error');
  auth.signInWithEmailAndPassword(email, password)
    .then(cred => {
      M.Modal.getInstance(document.getElementById('modal-login')).close();
      loginForm.reset();
      errorMsg.innerText = '';
    })
    .catch(error => {
      errorMsg.innerText = error.message;
    });
});

// logout
document.querySelectorAll('.logoutBtn')
  .forEach(el => el.addEventListener('click', e => {
    e.preventDefault();
    auth.signOut()
      .then(() => {
        console.log('Logout succesfull.');
      }).catch(alert)
  }));

// create 
const createWorkoutForm = document.getElementById('workout-form');
createWorkoutForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = createWorkoutForm['title'].value;
  const description = createWorkoutForm['description'].value;
  db.collection('workouts').add({ title, description, date: new Date() })
    .then(data => {
      M.Modal.getInstance(document.getElementById('modal-create')).close();
      createWorkoutForm.reset();
    })
    .catch(function (error) {
      alert(error.message);
    });
});

// makeadmin
const adminForm = document.getElementById('admin-form');

adminForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = adminForm['admin-email'].value;
  console.log(email);
  const makeAdminFunc = firebase.functions().httpsCallable('makeAdmin');
  makeAdminFunc({ email })
    .then(result => {
      console.log(result);
    })
    .catch(error => {
      console.log(error);
    });
});

function setupUi(user) {

  if (user) {
    user.getIdTokenResult()
      .then(token => {
        user.admin = token.claims.admin;
        document.querySelectorAll('.logged-in').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.logged-out').forEach(el => el.style.display = 'none');
        document.querySelector('nav .logoutBtn').innerHTML = user ? `Logout (${user.email})` : 'Logout';
        document.querySelectorAll('.admin').forEach(el => el.style.display = user.admin === true ? 'block' : 'none');

        //account modal
        db.collection('users')
          .doc(user.uid).get()
          .then(doc => {
            document.querySelector('.account-details').innerHTML = `<div>${user.email}</div>
    <div> ${doc.data().aboutMe}</div>
    <div class="text-yellow"> ${user.admin ? 'Admin' : ''}</div>
    `;
          })
      });
  } else {
    document.querySelectorAll('.logged-in').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.logged-out').forEach(el => el.style.display = 'block');
    document.querySelector('nav .logoutBtn').innerHTML = 'Logout';
    document.querySelectorAll('.admin').forEach(el => el.style.display = 'none');
    document.querySelector('.account-details').innerHTML = '';
  }
}

function fetchWorkouts(user) {
  if (user) {
    db.collection("workouts")
      // .get().then(querySnapshot => {
      .onSnapshot(querySnapshot => {
        let output = '';
        querySnapshot.forEach((doc) => {
          output +=
            `<li>
              <div class="collapsible-header grey lighten-4">${doc.data().title}</div>
              <div class="collapsible-body white">${doc.data().description}</div>
            </li>`;
        });
        document.getElementById('workouts').innerHTML = output;
      }, err => {
        console.log(err);
      });
  } else {
    document.getElementById('workouts').innerHTML = `<h5>Login to view data</h5>`;
  }
}
