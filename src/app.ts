// 드래그 앤 드랍 Interface
interface Draggable {
  dragStartHandler(event: DragEvent): void;

  dragEndHandler(event: DragEvent): void;
} 

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}


// 프로젝트 타입
  enum ProjectStatus { Active, Finished }

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {

  }
}

// 프로젝트 상태 관리 Management
 type Listener<T> = (items: T[]) => void;

 class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn)
  }
 }


class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, numOfPeple: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeple,
      ProjectStatus.Active
      );
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();


// 검증기능 (Validation) 
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;

  if(validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  if (validatableInput.min != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (validatableInput.max != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }

  return isValid;
}


// 자동 bind 데코레이터
function 자동바인드(_: any, _2: string, descriptor: PropertyDescriptor) {
  
  const 기존메서드 = descriptor.value;
  const 조정된Dec:PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = 기존메서드.bind(this);
      return boundFn;
    }
  }
  return 조정된Dec;
}

// Component Base Class  
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string,
  ) {
    this.templateElement = document.getElementById(
      templateId
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;
    
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as U;
    if(newElementId) {
      this.element.id = newElementId;
    }
    this.attach(insertAtStart);
  }

  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element);
  }

  abstract configure(): void;
  abstract renderContent(): void;
}


//ProjectItem Class
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable { //변경됨
  private project: Project;

  get 인원() {
    if(this.project.people === 1) {
      return '혼자';
    } else {
      return `${this.project.people} 명`;
    }
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id);
    this.project = project

    this.configure();
    this.renderContent();
  };

  @자동바인드
  dragStartHandler(event: DragEvent) { 
    console.log(event, '드래그 시작');
  };

  dragEndHandler(_: DragEvent) { 
    console.log('드래그 끝');
  };

  configure() {
      this.element.addEventListener('dragstart', this.dragStartHandler)  
      this.element.addEventListener('dragend', this.dragEndHandler)  
  };

  renderContent() {
      this.element.querySelector('h2')!.textContent = this.project.title;
      this.element.querySelector('h3')!.textContent = this.인원 + ' 참여함';
      this.element.querySelector('p')!.textContent = this.project.description;
  }
} 


// ProjectList Class
class ProjectList extends Component<HTMLDivElement, HTMLElement> { 
  assignedProjects: Project[];

  constructor(private type: 'active'|'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];
    this.configure();
    this.renderContent();
  }

  configure() {
    projectState.addListener((projects: Project[]) => {
      const releavantProjects = projects.filter(prj => {
        if(this.type === 'active') {
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      });
      this.assignedProjects = releavantProjects;
      this.renderProjects();
    });
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    listEl.innerHTML = '';
    for (const prjItem of this.assignedProjects) {
      // const listItem = document.createElement('li');
      // listItem.textContent = prjItem.title;
      // listEl?.appendChild(listItem);
      new ProjectItem(this.element.querySelector('ul')!.id, prjItem)
    }
  }

}


// ProjectInput Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> { 
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

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true
    };
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5
    };
    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5
    };

    if (
      // validate({value: enteredTitle, required: true, minLength: 5}) &&
      // validate({value: enteredDescription, required: true, minLength: 5}) &&
      // validate({value: enteredTitle, required: true, minLength: 5})
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
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

const prjInput = new ProjectInput();
const activeProject = new ProjectList('active');
const finishedProject = new ProjectList('finished');