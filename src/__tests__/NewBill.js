import { fireEvent, screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES } from "../constants/routes"
import firebase from "../__mocks__/firebase"
import BillsUI from "../views/BillsUI.js"

jest.mock("../app/Firestore");
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the newBill page should be rendered", () => {
      document.body.innerHTML = NewBillUI();
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    })
  })
  describe('When I am on NewBill Page and I add an image (jpg, jpeg or png)', () => {
		test('Then the file input should change', () => {
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({pathname})}
      let firestore=null;
      const newBill = new NewBill({ document, onNavigate, firestore, localStorage: window.localStorage })

      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const fileInput = document.querySelector(`input[data-testid="file"]`)
      fileInput.addEventListener('change', handleChangeFile)
      

    });
  });

})