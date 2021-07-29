import { fireEvent, screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from '../containers/Bills.js';
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import firebase from '../__mocks__/firebase.js';
import Firestore from "../app/Firestore.js";
import Router from "../app/Router.js";

jest.mock("../app/Firestore");


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      Firestore.bills = () => ({bills, get: jest.fn().mockResolvedValue()})
      Object.defineProperty(window, "localStorage", {value: localStorageMock,})
      window.localStorage.setItem('user',JSON.stringify({	type: 'Employee',email:"test@test"	}));
      const pathname = ROUTES_PATH["Bills"]
      Object.defineProperty(window, "location", {value: {hash: pathname}})
      document.body.innerHTML = `<div id="root"></div>`
      Router()
      expect(screen.getByTestId("icon-window").classList.contains("active-icon")).toBe(true)
      
    })
    //test si les dates sont  trier dans l'ordre décroissant
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    
    
  })
  //test loading page
  describe('When I am on bills page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {
      const html = BillsUI({loading: true})
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })
  //test error page
  describe('When I am on bills page but back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      const html = BillsUI({error: 'some error message'})
      document.body.innerHTML = html
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })
  //test click on new bill button
  describe('When I click on the Create a new bill button', () => {
		test('Then I should be sent to the NewBill page', () => {

			const html = BillsUI({ data: [] });
			document.body.innerHTML = html;
      window.localStorage.setItem('user',JSON.stringify({	type: 'Employee',email:"test@test"	}));

			const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname });};

			const Testbills = new Bills({document,onNavigate,firestore: null,localStorage: window.localStorage});

			const newBillButton = screen.getByTestId('btn-new-bill');
			const handleClickNewBill = jest.fn(() => Testbills.handleClickNewBill());

			newBillButton.addEventListener('click', handleClickNewBill);
			fireEvent.click(newBillButton);

			expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy();

		});
	});
  //test open modal
  describe('When I click on the Eye Icon button', () => {
		test('Then a modal with an image should open', () => {
			
			const html = BillsUI({ data: bills });
			document.body.innerHTML = html;
      Object.defineProperty(window, "localStorage",{value: localStorageMock,});
      window.localStorage.setItem('user',JSON.stringify({	type: 'Employee',email:"test@test"	}));

			const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname });};

      const Testbills = new Bills({document,onNavigate,firestore: null,localStorage: window.localStorage});

			$.fn.modal = jest.fn();

			const IconEyeButton = screen.getAllByTestId('icon-eye')[0];
			const handleClickIconEye = jest.fn(() => {Testbills.handleClickIconEye(IconEyeButton);});

			IconEyeButton.addEventListener('click', handleClickIconEye);
			fireEvent.click(IconEyeButton);

			expect(document.getElementById('modaleFile')).toBeTruthy();
		});
	});
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills UI", () => {
    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(firebase, "get");
      const bills = await firebase.get();
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(bills.data.length).toBe(4);
    });
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() => Promise.reject(new Error("Erreur 404")));
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    test("fetches bills from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() => Promise.reject(new Error("Erreur 500")));
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});