/**
 * @jest-environment jsdom
 */

 import { fireEvent, screen, waitFor } from "@testing-library/dom"
 import BillsUI from "../views/BillsUI.js"
 import { bills } from "../fixtures/bills.js"
 import { ROUTES_PATH } from "../constants/routes.js";
 import { localStorageMock } from "../__mocks__/localStorage.js";
 import mockStore from "../__mocks__/store"
 
 import router from "../app/Router.js";
 jest.mock("../app/store", () => mockStore)
 
 describe("Given I am connected as an employee", () => {
   describe("When I am on Bills Page", () => {
     it("Then bill icon in vertical layout should be highlighted", async () => {
 
       Object.defineProperty(window, 'localStorage', { value: localStorageMock })
       window.localStorage.setItem('user', JSON.stringify({
         type: 'Employee'
       }))
       const root = document.createElement("div")
       root.setAttribute("id", "root")
       document.body.append(root)
       router()
       window.onNavigate(ROUTES_PATH.Bills)
       await waitFor(() => screen.getByTestId('icon-window'))
       const windowIcon = screen.getByTestId('icon-window')
       expect(windowIcon.className).toContain("active-icon")
 
     })
 
     it("Then fetches bills from mock API GET will be success ", async () => {
       localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
       const root = document.createElement("div")
       root.setAttribute("id", "root")
       document.body.append(root)
       router()
       window.onNavigate(ROUTES_PATH.Bills);
       await waitFor(() => screen.getAllByTestId('icon-eye'))
       const iconEye = screen.getAllByTestId('icon-eye')
       expect(iconEye.length).toBe(4)
     })
 
 
     it("Then can add file", async () => {
       Object.defineProperty(window, 'localStorage', { value: localStorageMock })
       window.localStorage.setItem('user', JSON.stringify({
         type: 'Employee'
       }))
       const root = document.createElement("div")
       root.setAttribute("id", "root")
       document.body.append(root)
       router()
       window.onNavigate(ROUTES_PATH.Bills)
       await waitFor(() => screen.getAllByTestId('icon-eye'))
       const iconEye = screen.getAllByTestId('icon-eye')[0]
       expect(iconEye).toBeDefined()
       fireEvent.click(iconEye);
       await waitFor(() => screen.getByTestId('modale-file'))
       const modalFile = screen.getByTestId('modale-file')
       expect(modalFile.innerHTML).not.toBe("");
 
     })
 
     it("Then bills should be ordered from earliest to latest", () => {
       document.body.innerHTML = BillsUI({ data: bills })
       const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
       const antiChrono = (a, b) => ((a < b) ? 1 : -1)
       const datesSorted = [...dates].sort(antiChrono)
       expect(dates).toEqual(datesSorted)
     })
   })

   describe('When an error occurs on API', () => {
    beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(window, 'localStorage', {value: localStorageMock})

        window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee', 
            email: "a@a"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.innerHTML = ''
        document.body.append(root)
        router()
    })

  
    it('Then the page should fetch and fail with 404 error', async () => {

        mockStore.bills.mockImplementationOnce(() => {
            return {
                list: () => {
                    return Promise.reject(new Error('Error 404'));
                },
            };
        });

        window.onNavigate(ROUTES_PATH.Bills)
        document.body.innerHTML = BillsUI({error: 'Error 404'})
        await new Promise(process.nextTick)
        await waitFor(() => screen.getByText('Error 404'))
        const message = screen.getByText('Error 404')

        expect(message).toBeTruthy()


    });
    
    it('Then the page should fetch and fail with 500 error', async () => {
        mockStore.bills.mockImplementationOnce(() => {
            return {
                list: () => {
                    return Promise.reject(new Error('Error 500'));
                },
            };
        });

        window.onNavigate(ROUTES_PATH.Bills)
        document.body.innerHTML = BillsUI({error: 'Error 500'})
        await new Promise(process.nextTick)
        await waitFor(() => screen.getByText('Error 500'))
        const message = screen.getByText('Error 500')
        expect(message).toBeTruthy()
    });
    });
})
 
