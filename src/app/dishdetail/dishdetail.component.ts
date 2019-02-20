import { Component, OnInit, ViewChild } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';


@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

  @ViewChild('cform') commentFormDirective;
  commentForm: FormGroup;
  comment: Comment;

  formErrors = {
    'author': '',
    'comment': '',

  };

  ValidationMessages = {
    'author': {
      'required': 'Author Name is required',
      'minlength': 'Author Name must be at least 2 characters long'
    },
    'comment': {
      'required': 'Comment is required'
    }
  };
  
  //dish = DISH;
  
  dish: Dish;
  dishIds: string[];
  prev: string;
  next:string;


  constructor(private dishservice: DishService,private route: ActivatedRoute,private location: Location,private co: FormBuilder ) {
    this.createForm();
  }

  ngOnInit() {
    /*const id=this.route.snapshot.params['id'];
    this.dishservice.getDish(id)
      .subscribe(dish => this.dish = dish);*/
    this.dishservice.getDishIds()
      .subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'] )))
      .subscribe(dish => {this.dish = dish; this.setPrevNext(dish.id); });
  }

  createForm(): void{
    this.commentForm = this.co.group({
      author: ['', [Validators.required, Validators.minLength(2)]],
      rating: 5,
      comment: ['',[Validators.required]]
    });

    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged();

  }

  onValueChanged(data?: any){
    if(!this.commentForm) {return;}
    const form=this.commentForm;
    for(const field in this.formErrors){
      if(this.formErrors.hasOwnProperty(field)){
        this.formErrors[field]='';
        const control = form.get(field);
        if(control && control.dirty && !control.valid){
          const messages = this.ValidationMessages[field];
          for(const key in control.errors){
            if(control.errors.hasOwnProperty(key)){
              this.formErrors[field] += messages[key] + '';
            }
          }
        }
      }
    }

  }

  onSubmit(){
    this.comment = this.commentForm.value;
    console.log(this.comment);
    this.comment.date = Date();
    this.comment.rating = 5;
    this.dish.comments.push(this.comment);
    this.commentForm.reset({
      'author':'',
      'rating':5,
      'comment':''
    });
    this.commentFormDirective.resetForm();
  }

  goBack(): void{
    this.location.back();
  }

  setPrevNext(dishId: string) {
    const index=this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }
}
