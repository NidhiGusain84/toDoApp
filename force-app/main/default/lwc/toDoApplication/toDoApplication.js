import { LightningElement } from 'lwc';

export default class ToDoApplication extends LightningElement {
taskname = "";
taskdate = null;
incompletedTasks = [];
completedTasks = [];

    changeHandler(event){
        let {name, value } = event.target;
        if (name === "taskname") {
            this.taskname = value;
        } else if (name === "taskdate") {
            this.taskdate = value;           
        } 
        console.log(" Task Name: " + this.taskname);
         console.log(" Task Date: " + this.taskdate);
    }

    resetHandler(){
        this.taskname = "";
        this.taskdate = null;
    }

    addTaskHandler(){
        console.log(this.validateTask());
        //If task's end date is missing, set end date as today's date.
         if(!this.taskdate) {
            this.taskdate = new Date().toISOString().slice(0, 10);
        }

        if (this.validateTask()) {
            this.incompletedTasks = [...this.incompletedTasks,{
                taskname: this.taskname,
                taskdate: this.taskdate
            }];
            this.resetHandler();
            let sortedArray = this.sortTasks(this.incompletedTasks);
            this.incompletedTasks = [...sortedArray];
        }
       
    }

    validateTask(){
        let isValid = true;
        let element = this.template.querySelector(".taskname");
        if (!this.taskname) {
            isValid = false;
        }else {
           let taskItem = this.incompletedTasks.find(
            (currentItem) =>
            currentItem.taskname === this.taskname && 
            currentItem.taskdate === this.taskdate);     
             if (taskItem) {
              isValid = false;   
              element.setCustomValidity("Task is already added");
            }
        }
        if (isValid) {
            element.setCustomValidity("");
        }
        element.reportValidity();
        return isValid;             
        }

    sortTasks(inputArray){
         let sortedArray = inputArray.sort(
            (a, b) => {
                const dateA = new Date(a.taskdate);
                const dateB = new Date(b.taskdate);
                return dateA - dateB;
            }
         );
          return sortedArray;
    }

    removeHandler(event){
        //remove the entry from the incompletedTasks array and sort it again.
        let index = event.target.name;
        this.incompletedTasks.splice(index, 1);
        let sortedArray = this.sortTasks(this.incompletedTasks);
        this.incompletedTasks = [...sortedArray];
        
    }

    completeTaskHandler(event){
        let index = event.target.name;
       this.refereshData(index);
    }

    dragStartHandler(event){
        event.dataTransfer.setData("text", event.target.dataset.item);
    
    }

    allowDrop(event){
         event.preventDefault();
        }

    dropElementhandler(event){
        let data = event.dataTransfer.getData("text");
        this.refereshData(data);
    }

    refereshData(index){
        let removedItem = this.incompletedTasks.splice(index, 1);
       let sortedArray = this.sortTasks(this.incompletedTasks);
       this.incompletedTasks = [...sortedArray];
        this.completedTasks = [...this.completedTasks, removedItem[0]];
        console.log(this.incompletedTasks);
    }

}


