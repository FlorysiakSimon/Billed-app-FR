import { fireEvent, screen } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import BillsUI from '../views/BillsUI.js';
import { ROUTES } from '../constants/routes';
import firebase from '../__mocks__/firebase';
jest.mock("../app/Firestore");

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the newBill page should be rendered", () => {
      document.body.innerHTML = NewBillUI();
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    })
  })
  //test add img/png/jpg
  describe('When I am on NewBill Page and I add an image (jpg, jpeg or png)', () => {
		test('Then the file input should change', () => {
      const html = NewBillUI();
			document.body.innerHTML = html;

			const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname });};
			window.localStorage.setItem('user',JSON.stringify({	type: 'Employee',email:"test@test"	}));
			const newBill = new NewBill({	document,	onNavigate,	firestore: null,	localStorage: window.localStorage});

			const handleChangeFile = jest.fn((e) => {newBill.handleChangeFile(e);});

			const fileInput = screen.getByTestId('file');
			fileInput.addEventListener('change', handleChangeFile);
      const fileTest = new File(['fileTest'], 'test.png', {type: 'image/jpg'})

      fireEvent.change(fileInput, { target: { files: [fileTest] } })

			expect(handleChangeFile).toHaveBeenCalled();
			expect(fileInput.files[0]).toBe(fileTest);

    });
  });
  //test wrong img format
  describe('When I choose a new file in an incorrect format', () => {
		test('Then there should be an alert and the file input is reset', () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      jest.spyOn(window, 'alert').mockImplementation(() => {});

      const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname });};
			window.localStorage.setItem('user',JSON.stringify({	type: 'Employee',email:"test@test"	}));
			const newBill = new NewBill({	document,	onNavigate,	firestore: null,	localStorage: window.localStorage,});

			const handleChangeFile = jest.fn((e) => {newBill.handleChangeFile(e);});

			const fileInput = screen.getByTestId('file');
			fileInput.addEventListener('change', handleChangeFile);
      const fileTest = new File(['fileTest'], 'test.pdf', {type: 'text/pdf'})

      fireEvent.change(fileInput, { target: { files: [fileTest] } })

      expect(handleChangeFile).toHaveBeenCalled()
      expect(fileInput.files[0]).toStrictEqual(fileTest)
      expect(fileInput.value).toBe('')
      expect(window.alert).toHaveBeenCalled()
    });
  });
  //test submit newBill
  describe("When I am on NewBill Page and I click on submit button", () => {
    test("Then it should create a new bill and I should be redirected to the dashboard", () => {
      document.body.innerHTML = NewBillUI();
      
      const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname });};
			window.localStorage.setItem('user',JSON.stringify({	type: 'Employee',email:"test@test"	}));
			const newBill = new NewBill({document,	onNavigate,	firestore: null,	localStorage: window.localStorage});

      const handleSubmit = jest.fn(newBill.handleSubmit)
      

      const submitButton = screen.getByTestId('form-new-bill');
			submitButton.addEventListener('submit', handleSubmit);
			fireEvent.submit(submitButton);

			expect(handleSubmit).toHaveBeenCalled();
			expect(screen.getAllByText('Mes notes de frais')).toBeTruthy();
    });
  });
  
});

// Test d'integration POST
describe('When I am on NewBill Page and submit the form', () => {
  test('Then it should create a new bill and render Bills page', async () => {
    const postSpy = jest.spyOn(firebase, 'post');
    const newBill = {
      id: '47qAXb6fIm2zOKkLzMro',
      vat: '80',
      fileUrl:
        'https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a',
      status: 'pending',
      type: 'Hôtel et logement',
      commentary: 'séminaire billed',
      name: 'encore',
      fileName: 'preview-facture-free-201801-pdf-1.jpg',
      date: '2004-04-04',
      amount: 400,
      commentAdmin: 'ok',
      email: 'a@a',
      pct: 20,
    };
    const bills = await firebase.post(newBill);
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(bills.data.length).toBe(5);
  });
  test('Then it adds bill to the API and fails with 404 message error', async () => {
    firebase.post.mockImplementationOnce(() => Promise.reject(new Error('Erreur 404')));
    const html = BillsUI({ error: 'Erreur 404' });
    document.body.innerHTML = html;
    const message = await screen.getByText(/Erreur 404/);
    expect(message).toBeTruthy();
  });
  test('Then it adds bill to the API and fails with 500 message error', async () => {
    firebase.post.mockImplementationOnce(() => Promise.reject(new Error('Erreur 500')));
    const html = BillsUI({ error: 'Erreur 500' });
    document.body.innerHTML = html;
    const message = await screen.getByText(/Erreur 500/);
    expect(message).toBeTruthy();
  });
});