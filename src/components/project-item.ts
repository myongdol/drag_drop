import {Draggable} from '../models/drag-drop.js';
import 컴포넌트 from './base-components.js';
import { Project } from "../models/project.js";
import {자동바인드} from "../decorators/autobind.js"


    //ProjectItem Class
 export class ProjectItem extends 컴포넌트<HTMLUListElement, HTMLLIElement> implements Draggable {
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
      event.dataTransfer!.setData('text/plain', this.project.id);
      event.dataTransfer!.effectAllowed = 'move';
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
  
