import 컴포넌트 from "./base-components";
import * as Validation from "../util/validation";
import { 자동바인드 } from "../decorators/autobind"
import { projectState } from "../state/project-states";

    // ProjectInput Class
    export class ProjectInput extends 컴포넌트<HTMLDivElement, HTMLFormElement> { 
        titleInputElement: HTMLInputElement;
        descriptionInputElement: HTMLInputElement;
        peopleInputElement: HTMLInputElement;
    
        constructor() {
        super('project-input', 'app', true, 'user-input')
        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;
        this.configure();
        }
    
        configure() {
        this.element.addEventListener('submit', this.submitHandler)
        }
    
        renderContent()  {
            
        }
    
        private gatherUserInput(): [string, string, number]|void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;
    
        const titleValidatable: Validation.Validatable = {
            value: enteredTitle,
            required: true
        };
        const descriptionValidatable: Validation.Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        };
        const peopleValidatable: Validation.Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        };
    
        if (
            // validate({value: enteredTitle, required: true, minLength: 5}) &&
            // validate({value: enteredDescription, required: true, minLength: 5}) &&
            // validate({value: enteredTitle, required: true, minLength: 5})
            !Validation.validate(titleValidatable) ||
            !Validation.validate(descriptionValidatable) ||
            !Validation.validate(peopleValidatable)
        ) {
            alert('잘못된 입력 입니다. 다시 시도 해주세요.')
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople]
        }
        }
    
        private clearInput() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
        }
    
        @자동바인드
        private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if(Array.isArray(userInput)) {
            const [title, desc, people] = userInput;
            projectState.addProject(title, desc, people);
            this.clearInput();
        }
        }
    
    }
